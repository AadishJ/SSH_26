# Diabetic Retinopathy - MATLAB Inference

This folder contains a pure MATLAB implementation of the Sparse-BagNet Diabetic Retinopathy classifier. It runs completely independently of Python/PyTorch and allows you to generate predictions and spatial evidence (attention) heatmaps directly in MATLAB.

## Requirements
* **MATLAB R2021a or newer** (tested on R2026a).
* **Deep Learning Toolbox**.
* **Deep Learning Toolbox Converter for ONNX Model Format** (This is a free add-on. If you don't have it, go to MATLAB's Home tab -> Add-Ons -> Search for "ONNX" and install it).

## Contents
* `evaluate_dr.m`: The main MATLAB function that loads the model, runs inference, and generates the plots.
* `exported_model/`: Contains the pre-trained neural network.
  * `backbone.onnx`: The convolutional layers exported to ONNX format.
  * `model_weights.mat`: The final classification and attention weights.
* `images/`: A few sample fundus images provided for testing.

## How to Run

1. Open MATLAB and navigate to this folder (`MATLAB_Inference`).
2. Run the `evaluate_dr` function by passing the path to an image and the path to the model directory.

You can copy and paste this example into the MATLAB command window:

```matlab
% Evaluate a sample image
image_path = 'images/000c1434d8d7.png';
results = evaluate_dr(image_path, './exported_model');
```

## What it Outputs

A 4-panel figure will open displaying:
1. The original fundus image.
2. The raw spatial attention map.
3. The original image superimposed with the evidence heatmap.
4. The predicted clinical class and a bar chart of the model's confidence across all 5 severity levels.

The `results` variable in your workspace will contain the raw probability arrays, attention maps, and the final clinical prediction.
