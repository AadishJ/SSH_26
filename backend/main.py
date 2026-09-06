import base64
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BACKEND_DIR.parent

# Auto-detect MATLAB_DIR: prefer DR-Screening-MATLAB-main, fallback to DR-Screening-MATLAB
def _resolve_matlab_dir() -> Path:
    env_dir = os.getenv("MATLAB_INFERENCE_DIR")
    if env_dir:
        return Path(env_dir).resolve()
    for candidate in ["DR-Screening-MATLAB-main", "DR-Screening-MATLAB"]:
        p = PROJECT_DIR / candidate
        if p.is_dir():
            return p.resolve()
    return (PROJECT_DIR / "DR-Screening-MATLAB-main").resolve()


MATLAB_DIR = _resolve_matlab_dir()
MODEL_DIR = Path(os.getenv("MATLAB_MODEL_DIR", MATLAB_DIR / "exported_model")).resolve()
INFERENCE_MODE = os.getenv("INFERENCE_MODE", "local").lower()  # "local" or "docker"
MATLAB_DOCKER_IMAGE = os.getenv("MATLAB_DOCKER_IMAGE", "retina-matlab:r2026a")
DOCKER_COMMAND = os.getenv("DOCKER_COMMAND", "docker")
INFERENCE_TIMEOUT_SECONDS = int(os.getenv("INFERENCE_TIMEOUT_SECONDS", "300"))
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp"}


def _find_matlab_executable() -> Optional[str]:
    """Find the MATLAB executable on the system."""
    # 1. Environment variable override
    env_exe = os.getenv("MATLAB_EXECUTABLE")
    if env_exe and Path(env_exe).is_file():
        return env_exe

    # 2. Check PATH
    which_matlab = shutil.which("matlab")
    if which_matlab:
        return which_matlab

    # 3. Known Windows installations
    program_files = os.environ.get("ProgramFiles", r"C:\Program Files")
    releases = ["R2026a", "R2025b", "R2025a", "R2024b", "R2024a", "R2023b", "R2023a", "R2022b", "R2022a", "R2021b", "R2021a"]
    for rel in releases:
        candidate = Path(program_files) / "MATLAB" / rel / "bin" / "matlab.exe"
        if candidate.is_file():
            return str(candidate)

    # 4. Glob check under MATLAB install directory
    matlab_root = Path(program_files) / "MATLAB"
    if matlab_root.is_dir():
        matches = list(matlab_root.glob("*/bin/matlab.exe"))
        if matches:
            return str(matches[0])

    return None


app = FastAPI(title="Diabetic Retinopathy Inference API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _validate_matlab_assets() -> None:
    if not MATLAB_DIR.is_dir():
        raise HTTPException(
            status_code=500,
            detail=f"MATLAB inference directory not found: {MATLAB_DIR}",
        )
    if (
        not (MODEL_DIR / "backbone.onnx").is_file()
        or not (MODEL_DIR / "model_weights.mat").is_file()
    ):
        raise HTTPException(
            status_code=500, detail=f"MATLAB model files not found in: {MODEL_DIR}"
        )


def _run_matlab_local(image_path: Path, output_json: Path, overlay_path: Path) -> dict:
    """Run MATLAB inference directly on the host using the installed MATLAB engine."""
    _validate_matlab_assets()
    matlab_exe = _find_matlab_executable()
    if not matlab_exe:
        raise HTTPException(
            status_code=503,
            detail="MATLAB executable not found. Ensure MATLAB is installed and in PATH or set MATLAB_EXECUTABLE.",
        )

    # Use forward slashes for MATLAB string literals (safe across OS)
    backend_dir_str = BACKEND_DIR.as_posix()
    matlab_dir_str = MATLAB_DIR.as_posix()
    image_path_str = image_path.as_posix()
    model_dir_str = MODEL_DIR.as_posix()
    output_json_str = output_json.as_posix()
    overlay_path_str = overlay_path.as_posix()

    matlab_cmd = (
        f"addpath('{backend_dir_str}'); "
        f"addpath('{matlab_dir_str}'); "
        f"run_inference_json('{image_path_str}', '{model_dir_str}', '{output_json_str}', '{overlay_path_str}');"
    )

    cmd_args = [matlab_exe, "-batch", matlab_cmd]

    try:
        completed = subprocess.run(
            cmd_args,
            capture_output=True,
            text=True,
            timeout=INFERENCE_TIMEOUT_SECONDS,
            check=False,
        )
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"MATLAB executable not found: {matlab_exe}",
        ) from exc
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(
            status_code=504, detail="MATLAB inference timed out"
        ) from exc

    if completed.returncode != 0 or not output_json.is_file():
        diagnostics = (completed.stderr or completed.stdout or "").strip()
        raise HTTPException(
            status_code=500,
            detail=f"MATLAB inference failed (exit code {completed.returncode}): {diagnostics[-2000:]}",
        )

    try:
        return json.loads(output_json.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=500, detail="MATLAB returned an invalid inference result"
        ) from exc


def _run_matlab_docker(image_path: Path, output_json: Path, overlay_path: Path) -> dict:
    """Run MATLAB inference inside a Docker container (Linux / deployment mode)."""
    _validate_matlab_assets()

    image_name = image_path.name
    matlab_command = (
        "addpath('/workspace/backend'); "
        "addpath('/workspace/matlab'); "
        f"run_inference_json('/workspace/input/{image_name}', "
        "'/workspace/model', "
        "'/workspace/output/result.json', "
        "'/workspace/output/evidence_overlay.png')"
    )

    # Cross-platform UID/GID fallback (Windows does not have os.getuid)
    user_uid = getattr(os, "getuid", lambda: 1000)()
    user_gid = getattr(os, "getgid", lambda: 1000)()

    docker_args = [
        DOCKER_COMMAND,
        "run",
        "--rm",
        "--init",
        "--shm-size=512M",
        "--user",
        "root",
        "-e",
        f"USER_NAME={os.getenv('USER', 'matlab')}",
        "-e",
        f"USER_UID={user_uid}",
        "-e",
        f"USER_GID={user_gid}",
        "-v",
        f"{image_path.parent}:/workspace/input:ro",
        "-v",
        f"{BACKEND_DIR}:/workspace/backend:ro",
        "-v",
        f"{MATLAB_DIR}:/workspace/matlab:ro",
        "-v",
        f"{MODEL_DIR}:/workspace/model:ro",
        "-v",
        f"{output_json.parent}:/workspace/output",
    ]
    license_file = os.getenv("MLM_LICENSE_FILE")
    if license_file:
        if Path(license_file).is_file():
            license_path = Path(license_file).resolve()
            docker_args.extend(
                [
                    "-v",
                    f"{license_path.parent}:/workspace/license:ro",
                    "-e",
                    f"MLM_LICENSE_FILE=/workspace/license/{license_path.name}",
                ]
            )
        else:
            docker_args.extend(["-e", f"MLM_LICENSE_FILE={license_file}"])
    docker_args.extend([MATLAB_DOCKER_IMAGE, "-batch", matlab_command])

    try:
        completed = subprocess.run(
            docker_args,
            capture_output=True,
            text=True,
            timeout=INFERENCE_TIMEOUT_SECONDS,
            check=False,
        )
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Docker executable not found: {DOCKER_COMMAND}. Install Docker and make sure it is on PATH.",
        ) from exc
    except PermissionError as exc:
        raise HTTPException(
            status_code=503,
            detail="The backend process cannot access the Docker daemon",
        ) from exc
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(
            status_code=504, detail="MATLAB Docker inference timed out"
        ) from exc

    if completed.returncode != 0 or not output_json.is_file():
        diagnostics = (completed.stderr or completed.stdout or "").strip()
        raise HTTPException(
            status_code=500,
            detail=f"MATLAB Docker inference failed: {diagnostics[-2000:]}",
        )

    try:
        return json.loads(output_json.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=500, detail="MATLAB returned an invalid inference result"
        ) from exc


def _run_matlab(image_path: Path, output_json: Path, overlay_path: Path) -> dict:
    if INFERENCE_MODE == "docker":
        return _run_matlab_docker(image_path, output_json, overlay_path)
    return _run_matlab_local(image_path, output_json, overlay_path)


@app.get("/health")
def health() -> dict[str, Any]:
    matlab_exe = _find_matlab_executable()
    return {
        "status": "ok",
        "inference_mode": INFERENCE_MODE,
        "matlab_executable": matlab_exe,
        "matlab_inference_dir": str(MATLAB_DIR),
        "matlab_inference_dir_exists": MATLAB_DIR.is_dir(),
        "model_dir": str(MODEL_DIR),
        "model_files_found": (
            (MODEL_DIR / "backbone.onnx").is_file()
            and (MODEL_DIR / "model_weights.mat").is_file()
        ),
    }


@app.post("/predict")
def predict(file: UploadFile = File(...)) -> dict:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415, detail="Upload a PNG, JPG, JPEG, TIFF, or BMP fundus image"
        )

    with tempfile.TemporaryDirectory(prefix="dr-inference-") as temporary_directory:
        temporary_dir = Path(temporary_directory)
        image_path = temporary_dir / f"input{suffix}"
        output_json = temporary_dir / "result.json"
        overlay_path = temporary_dir / "evidence_overlay.png"

        with image_path.open("wb") as destination:
            shutil.copyfileobj(file.file, destination)

        result = _run_matlab(image_path, output_json, overlay_path)
        if overlay_path.is_file():
            result["evidence_overlay_base64"] = base64.b64encode(
                overlay_path.read_bytes()
            ).decode("ascii")
            result["evidence_overlay_media_type"] = "image/png"

    return result
