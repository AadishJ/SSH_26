function run_inference_json(image_path, model_dir, output_json, overlay_path)
% Run evaluate_dr without interactive figures and serialize its API result.
set(0, 'DefaultFigureVisible', 'off');
results = evaluate_dr(image_path, model_dir);
close all force;

payload.predicted_class = results.predicted_class;
payload.predicted_label = results.predicted_label;
payload.probabilities = results.probabilities;
payload.attention_map = results.attention_map;
payload.attention_map_norm = results.attention_map_norm;
imwrite(results.evidence_overlay, overlay_path);

file_id = fopen(output_json, 'w');
if file_id == -1
    error('run_inference_json:outputError', 'Could not open output JSON: %s', output_json);
end
cleanup = onCleanup(@() fclose(file_id));
fprintf(file_id, '%s', jsonencode(payload));
end