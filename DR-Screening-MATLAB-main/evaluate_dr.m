function results = evaluate_dr(image_path, model_dir)
%EVALUATE_DR  Evaluate a fundus image for Diabetic Retinopathy.
%
%   results = evaluate_dr(IMAGE_PATH, MODEL_DIR)
%
%   Loads the exported Sparse-BagNet model (ONNX backbone + attention
%   weights), classifies the input fundus image into one of 5 DR grades,
%   and generates a spatial evidence/attention map showing which regions
%   of the retina the model considers most diagnostic.
%
%   INPUTS:
%     IMAGE_PATH  -  Path to a single fundus image (.png or .jpg)
%     MODEL_DIR   -  Directory containing the exported model files:
%                       backbone.onnx      (backbone CNN in ONNX format)
%                       model_weights.mat  (conv2 + attention layer weights)
%                    These files are created by running export_to_onnx.py.
%
%   OUTPUTS:
%     results  -  Struct with the following fields:
%       .predicted_class       - Integer 1..5 (MATLAB 1-indexed)
%       .predicted_label       - String (e.g. 'Moderate DR')
%       .probabilities         - [1x5] softmax probability per class
%       .attention_map         - [60x60] raw attention weights (spatial)
%       .attention_map_norm    - [60x60] normalized to [0, 1]
%       .evidence_overlay      - [512x512x3] uint8 overlay image
%
%   EXAMPLE:
%     results = evaluate_dr('test_image.png', './exported_model');
%     fprintf('Prediction: %s (%.1f%%)\n', results.predicted_label, ...
%              results.probabilities(results.predicted_class)*100);
%
%   REQUIREMENTS:
%     - MATLAB R2021a or later
%     - Deep Learning Toolbox
%     - Deep Learning Toolbox Converter for ONNX Model Format
%
%   See also: export_to_onnx.py

%% ========================= CONSTANTS =========================
CLASS_NAMES = {'No DR', 'Mild DR', 'Moderate DR', 'Severe DR', 'Proliferative DR'};
INPUT_SIZE  = 512;
MEAN        = [0.41326871514320374, 0.2723627984523773, 0.18590997159481049];
STD         = [0.29345420002937317, 0.20033970475196838, 0.15474912524223328];
NUM_CLASSES = 5;
FEAT_H      = 60;   % backbone feature map height
FEAT_W      = 60;   % backbone feature map width
K           = FEAT_H * FEAT_W;   % 3600 spatial patches

%% ========================= VALIDATE INPUTS =========================
if ~isfile(image_path)
    error('evaluate_dr:fileNotFound', 'Image not found: %s', image_path);
end

onnx_path    = fullfile(model_dir, 'backbone.onnx');
weights_path = fullfile(model_dir, 'model_weights.mat');

if ~isfile(onnx_path)
    error('evaluate_dr:modelNotFound', ...
        'backbone.onnx not found in "%s".\nRun export_to_onnx.py first.', model_dir);
end
if ~isfile(weights_path)
    error('evaluate_dr:modelNotFound', ...
        'model_weights.mat not found in "%s".\nRun export_to_onnx.py first.', model_dir);
end

%% ========================= LOAD MODEL =========================
fprintf('Loading backbone from ONNX...\n');
try
    net = importNetworkFromONNX(onnx_path);
catch ME
    error('evaluate_dr:importFailed', ...
        ['Failed to import ONNX model.\n' ...
         'Requires MATLAB with Deep Learning Toolbox and ONNX converter add-on.\n' ...
         'Error: %s'], ME.message);
end

fprintf('Loading classification & attention weights...\n');
W = load(weights_path);

%% ========================= PREPROCESS IMAGE =========================
fprintf('Preprocessing: %s\n', image_path);
img_original = imread(image_path);

% Convert to RGB if grayscale
if size(img_original, 3) == 1
    img_original = repmat(img_original, [1, 1, 3]);
end

img_resized = imresize(img_original, [INPUT_SIZE, INPUT_SIZE]);
img_float   = single(img_resized) / 255.0;

% Channel-wise normalization (matches PyTorch training transforms)
for c = 1:3
    img_float(:,:,c) = (img_float(:,:,c) - MEAN(c)) / STD(c);
end

%% ========================= RUN BACKBONE (ONNX) =========================
fprintf('Running backbone inference...\n');

% Create dlarray: SSCB = [Height, Width, Channels, Batch]
X = dlarray(single(img_float), 'SSCB');
Y = predict(net, X);

% Extract numeric array and remove batch dimension
features = extractdata(Y);
features = squeeze(features);

% Handle output format: could be HWC (MATLAB convention) or CHW (ONNX convention)
sz = size(features);
if sz(1) == 2048
    % CHW format: [2048, 60, 60] -> convert to [60, 60, 2048]
    features_hwc = permute(features, [2, 3, 1]);
elseif sz(3) == 2048
    % HWC format: [60, 60, 2048] (standard MATLAB)
    features_hwc = features;
else
    error('evaluate_dr:unexpectedShape', ...
        'Unexpected backbone output shape: [%s]. Expected [60,60,2048] or [2048,60,60].', ...
        num2str(sz));
end

assert(isequal(size(features_hwc), [FEAT_H, FEAT_W, 2048]), ...
    'Backbone output shape mismatch: got [%s], expected [60, 60, 2048].', ...
    num2str(size(features_hwc)));

%% ========================= SPATIAL FLATTENING =========================
% CRITICAL: PyTorch flattens spatial dims in ROW-MAJOR order (h varies
% slowest, w varies fastest). MATLAB reshape is COLUMN-MAJOR (first index
% varies fastest). To match PyTorch's ordering, we permute (W, H, C) so
% that after MATLAB's column-major reshape, the patches follow row-major
% spatial order: (0,0), (0,1), ..., (0,59), (1,0), (1,1), ...
%
% This is essential for the attention weights to align with the correct
% spatial positions.

features_whc = permute(features_hwc, [2, 1, 3]);    % [W=60, H=60, C=2048]
patches      = reshape(features_whc, [K, 2048]);     % [3600, 2048]

%% ========================= APPLY CONV2 (1x1 classification) =========================
% Conv2d(2048, 5, kernel=1x1) is equivalent to a matrix multiply per
% spatial location: output = W * input + b

conv2_w = squeeze(W.conv2_weight);   % [5, 2048, 1, 1] -> [5, 2048]
conv2_b = W.conv2_bias(:);           % [5, 1] column vector

feat_2d      = patches';                             % [2048, 3600]
local_scores = conv2_w * feat_2d + conv2_b;          % [5, 3600]

%% ========================= COMPUTE ATTENTION =========================
% Gated attention mechanism:
%   att_weight = sigmoid( Linear_outer( tanh(Linear_tanh(x)) * sigmoid(Linear_sigm(x)) ) )
%
% nn.Linear computes: output = input @ weight^T + bias

% att_tanh: Linear(2048, 2048) + Tanh
h_tanh = tanh(patches * W.att_tanh_weight' + W.att_tanh_bias);       % [3600, 2048]

% att_sigm: Linear(2048, 2048) + Sigmoid
z_sigm = patches * W.att_sigm_weight' + W.att_sigm_bias;             % [3600, 2048]
h_sigm = 1 ./ (1 + exp(-z_sigm));                                    % sigmoid

% Element-wise gating
gated = h_tanh .* h_sigm;                                            % [3600, 2048]

% att_outer: Linear(2048, 1) + Sigmoid
z_outer    = gated * W.att_outer_weight' + W.att_outer_bias;          % [3600, 1]
att_weights = 1 ./ (1 + exp(-z_outer));                               % [3600, 1]

%% ========================= COMPUTE PREDICTION =========================
% Replicate PyTorch's exact computation:
%   x_local.view(1, 3600, 5)  — row-major reinterpretation of [5, 60, 60]
%   pred = sum(x_local_viewed * x_weight, dim=patches)
%
% To convert from MATLAB's column-major to PyTorch's row-major view:
%   1. Transpose local_scores to get row-major flat order
%   2. Reshape with transposed dims, then transpose back

flat_py          = reshape(local_scores', [], 1);              % [18000, 1] PyTorch flat order
x_local_viewed   = reshape(flat_py, [NUM_CLASSES, K])';        % [3600, 5]

% Weighted sum of local predictions
pred = sum(x_local_viewed .* att_weights, 1);                  % [1, 5]

% Softmax
pred_shifted = pred - max(pred);                               % numerical stability
probs        = exp(pred_shifted) ./ sum(exp(pred_shifted));    % [1, 5]

[~, predicted_class] = max(probs);
predicted_label      = CLASS_NAMES{predicted_class};

%% ========================= EVIDENCE MAP =========================
% Reshape attention weights from flat [3600, 1] back to 2D spatial map.
% The patches are in row-major order, so reshape as [W, H] (MATLAB
% column-major) then transpose to get correct [H, W] orientation.

attention_map = reshape(att_weights, [FEAT_W, FEAT_H])';       % [60, 60]

% Normalize to [0, 1] for visualization
att_min = min(attention_map(:));
att_max = max(attention_map(:));
attention_map_norm = (attention_map - att_min) / (att_max - att_min + 1e-8);

% Upscale to image resolution
attention_full = imresize(attention_map_norm, [INPUT_SIZE, INPUT_SIZE]);

%% ========================= VISUALIZATION =========================
fig = figure('Name', 'Sparse-BagNet DR Evaluation', 'NumberTitle', 'off', ...
             'Position', [50, 100, 1500, 450], 'Color', 'w');

% --- Panel 1: Original Image ---
subplot(1, 4, 1);
imshow(img_resized);
title('Input Fundus Image', 'FontSize', 13);

% --- Panel 2: Attention Heatmap (raw) ---
subplot(1, 4, 2);
imagesc(attention_map_norm);
colormap(gca, jet);
colorbar;
axis image off;
title('Attention Map (60×60)', 'FontSize', 13);

% --- Panel 3: Evidence Overlay ---
subplot(1, 4, 3);
imshow(img_resized);
hold on;
h_overlay = imagesc(attention_full);
colormap(gca, jet);
set(h_overlay, 'AlphaData', 0.5);
hold off;
title('Evidence Overlay', 'FontSize', 13);

% --- Panel 4: Class Probabilities ---
subplot(1, 4, 4);
barh(probs, 'FaceColor', [0.2 0.6 0.9]);
set(gca, 'YTick', 1:5, 'YTickLabel', CLASS_NAMES, 'FontSize', 11);
xlabel('Probability', 'FontSize', 12);
xlim([0, 1]);
grid on;
title(sprintf('Prediction: %s', predicted_label), 'FontSize', 13, 'Color', [0.8 0 0]);

sgtitle(sprintf('DR Classification  —  %s  (%.1f%% confidence)', ...
    predicted_label, probs(predicted_class) * 100), ...
    'FontSize', 15, 'FontWeight', 'bold');

% Create evidence overlay image for output
heatmap_rgb  = uint8(255 * ind2rgb(round(attention_full * 255), jet(256)));
evidence_overlay = uint8(double(img_resized) * 0.5 + double(heatmap_rgb) * 0.5);

%% ========================= OUTPUT STRUCT =========================
results.predicted_class      = predicted_class;          % 1..5 (MATLAB 1-indexed)
results.predicted_label      = predicted_label;
results.probabilities        = probs;                    % [1x5]
results.attention_map        = attention_map;             % [60x60] raw
results.attention_map_norm   = attention_map_norm;        % [60x60] normalized
results.evidence_overlay     = evidence_overlay;          % [512x512x3] uint8

%% ========================= CONSOLE OUTPUT =========================
fprintf('\n============================== RESULTS ==============================\n');
fprintf('  Predicted Class : %d  —  %s\n', predicted_class, predicted_label);
fprintf('  Confidence      : %.2f%%\n\n', probs(predicted_class) * 100);
fprintf('  Class Probabilities:\n');
for i = 1:NUM_CLASSES
    bar_len = round(probs(i) * 40);
    bar_str = [repmat('█', 1, bar_len), repmat('░', 1, 40 - bar_len)];
    fprintf('    %-20s  %s  %.2f%%\n', CLASS_NAMES{i}, bar_str, probs(i) * 100);
end
fprintf('=====================================================================\n');

end
