const API_URL = window.RETINA_API_URL || "http://localhost:8000";
const CLASS_NAMES = [
  "No DR",
  "Mild DR",
  "Moderate DR",
  "Severe DR",
  "Proliferative DR",
];

const fileInput = document.querySelector("#fileInput");
const dropzone = document.querySelector("#dropzone");
const dropzoneTitle = document.querySelector("#dropzoneTitle");
const dropzoneHint = document.querySelector("#dropzoneHint");
const previewWrap = document.querySelector("#previewWrap");
const previewImage = document.querySelector("#previewImage");
const fileName = document.querySelector("#fileName");
const analyzeButton = document.querySelector("#analyzeButton");
const changeButton = document.querySelector("#changeButton");
const loadingMessage = document.querySelector("#loadingMessage");
const errorMessage = document.querySelector("#errorMessage");
const emptyResults = document.querySelector("#emptyResults");
const resultsContent = document.querySelector("#resultsContent");
const resetButton = document.querySelector("#resetButton");
let selectedFile = null;
let previewUrl = null;

function selectFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    showError(
      "Please choose a retinal image in PNG, JPG, TIFF, or BMP format.",
    );
    return;
  }
  selectedFile = file;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  previewImage.src = previewUrl;
  fileName.textContent = file.name;
  dropzone.classList.add("hidden");
  previewWrap.classList.remove("hidden");
  analyzeButton.disabled = false;
  clearError();
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function clearError() {
  errorMessage.classList.add("hidden");
  errorMessage.textContent = "";
}

function setLoading(isLoading) {
  analyzeButton.disabled = isLoading || !selectedFile;
  analyzeButton.querySelector("span:first-child").textContent = isLoading
    ? "Processing..."
    : "Run screening";
  loadingMessage.classList.toggle("hidden", !isLoading);
}

function drawAttentionMap(values) {
  const canvas = document.querySelector("#attentionCanvas");
  const context = canvas.getContext("2d");
  const rows = values.length;
  const columns = values[0]?.length || 0;
  const image = context.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const value = Number(
        values[Math.floor((y * rows) / canvas.height)]?.[
          Math.floor((x * columns) / canvas.width)
        ] || 0,
      );
      const color = heatColor(value);
      const index = (y * canvas.width + x) * 4;
      image.data[index] = color[0];
      image.data[index + 1] = color[1];
      image.data[index + 2] = color[2];
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
}

function heatColor(value) {
  const stops = [
    [25, 61, 130],
    [34, 182, 155],
    [243, 211, 74],
    [233, 77, 60],
  ];
  const scaled = Math.max(0, Math.min(0.999, value)) * (stops.length - 1);
  const lower = Math.floor(scaled);
  const upper = Math.min(stops.length - 1, lower + 1);
  const amount = scaled - lower;
  return stops[lower].map((channel, index) =>
    Math.round(channel + (stops[upper][index] - channel) * amount),
  );
}

function renderResults(result) {
  const predictionIndex = Number(result.predicted_class) - 1;
  const confidence = Number(result.probabilities?.[predictionIndex] || 0);
  document.querySelector("#predictionLabel").textContent =
    result.predicted_label || CLASS_NAMES[predictionIndex] || "Unknown";
  document.querySelector("#classLevel").textContent =
    `LEVEL ${predictionIndex >= 0 ? predictionIndex : "--"}`;
  document.querySelector("#confidenceValue").textContent =
    `${(confidence * 100).toFixed(1)}%`;
  document.querySelector("#confidenceFill").style.width =
    `${confidence * 100}%`;
  if (result.attention_map_norm) drawAttentionMap(result.attention_map_norm);
  if (result.evidence_overlay_base64)
    document.querySelector("#overlayImage").src =
      `data:${result.evidence_overlay_media_type || "image/png"};base64,${result.evidence_overlay_base64}`;

  const probabilities = document.querySelector("#probabilities");
  probabilities
    .querySelectorAll(".probability-row")
    .forEach((row) => row.remove());
  (result.probabilities || []).forEach((probability, index) => {
    const row = document.createElement("div");
    row.className = "probability-row";
    row.innerHTML = `<label>${CLASS_NAMES[index] || `Class ${index + 1}`}</label><div class="probability-track"><span style="width:${Number(probability) * 100}%"></span></div><strong>${(Number(probability) * 100).toFixed(1)}%</strong>`;
    probabilities.appendChild(row);
  });
  emptyResults.classList.add("hidden");
  resultsContent.classList.remove("hidden");
}

async function analyze() {
  if (!selectedFile) return;
  clearError();
  setLoading(true);
  const formData = new FormData();
  formData.append("file", selectedFile);
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();
    if (!response.ok)
      throw new Error(payload.detail || "The inference request failed.");
    renderResults(payload);
  } catch (error) {
    showError(
      error.message.includes("Failed to fetch")
        ? "Could not connect to the backend. Start FastAPI on port 8000 and try again."
        : error.message,
    );
  } finally {
    setLoading(false);
  }
}

function reset() {
  selectedFile = null;
  fileInput.value = "";
  previewWrap.classList.add("hidden");
  dropzone.classList.remove("hidden");
  dropzoneTitle.textContent = "Drop image here";
  dropzoneHint.textContent = "or click to browse your files";
  emptyResults.classList.remove("hidden");
  resultsContent.classList.add("hidden");
  clearError();
  analyzeButton.disabled = true;
}

fileInput.addEventListener("change", (event) =>
  selectFile(event.target.files[0]),
);
["dragenter", "dragover"].forEach((eventName) =>
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  }),
);
["dragleave", "drop"].forEach((eventName) =>
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
  }),
);
dropzone.addEventListener("drop", (event) =>
  selectFile(event.dataTransfer.files[0]),
);
changeButton.addEventListener("click", () => fileInput.click());
analyzeButton.addEventListener("click", analyze);
resetButton.addEventListener("click", reset);
