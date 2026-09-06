# MATLAB Inference API

This service accepts a fundus image, runs `evaluate_dr.m` through the MathWorks MATLAB Docker image, and returns the prediction and spatial evidence.

## Setup

From this directory:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Build the MATLAB inference image once before starting the API. This derived image uses the official MathWorks image and adds the toolboxes required by `evaluate_dr.m`:

```bash
cd backend
docker build -f Dockerfile.matlab -t retina-matlab:r2026a .
cd ..
```

The MathWorks container requires a MATLAB license configured for cloud use. For a network license, set `MLM_LICENSE_FILE` to the license manager address:

```bash
export MLM_LICENSE_FILE=27000@MyLicenseServer
```

For a local license file, set `MLM_LICENSE_FILE` to its host path; the backend mounts it into the MATLAB container automatically. The default model location is `../DR-Screening-MATLAB/exported_model`.

```bash
python -m uvicorn main:app --reload --port 8000
```

Optional configuration:

```bash
export MATLAB_DOCKER_IMAGE=retina-matlab:r2026a
export MATLAB_INFERENCE_DIR=/path/to/DR-Screening-MATLAB
export MATLAB_MODEL_DIR=/path/to/DR-Screening-MATLAB/exported_model
```

## API

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@../DR-Screening-MATLAB/images/000c1434d8d7.png"
```

The response contains `predicted_class` (1-based, matching MATLAB), `predicted_label`, `probabilities`, `attention_map`, `attention_map_norm`, and `evidence_overlay_base64`.
