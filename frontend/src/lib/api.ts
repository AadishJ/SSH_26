export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PredictResponse {
  predicted_class: number; // 1-indexed (1=No DR, 2=Mild, 3=Moderate, 4=Severe, 5=PDR)
  predicted_label: string;
  probabilities: number[];
  attention_map: number[][];
  attention_map_norm: number[][];
  evidence_overlay_base64: string;
  evidence_overlay_media_type: string;
}

export async function predictDR(file: File): Promise<PredictResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        payload.detail || `Inference failed with status ${response.status}`
      );
    }

    return payload as PredictResponse;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
      throw new Error(
        "Could not connect to the MATLAB backend. Make sure the FastAPI server is running on port 8000."
      );
    }
    throw new Error(message);
  }
}

export async function checkBackendHealth(): Promise<{
  online: boolean;
  details?: Record<string, unknown>;
}> {
  try {
    const res = await fetch(`${API_URL}/health`, { method: "GET" });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, details: data };
  } catch {
    return { online: false };
  }
}

