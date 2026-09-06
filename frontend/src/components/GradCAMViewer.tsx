"use client";
import { useEffect, useRef, useState } from "react";
import { MockReport } from "@/lib/mockData";
import styles from "./GradCAMViewer.module.css";

interface GradCAMViewerProps {
  report: MockReport;
  imagePreview: string;
}

function heatColor(value: number): [number, number, number] {
  const stops: [number, number, number][] = [
    [25, 61, 130],
    [34, 182, 155],
    [243, 211, 74],
    [233, 77, 60],
  ];
  const scaled = Math.max(0, Math.min(0.999, value)) * (stops.length - 1);
  const lower = Math.floor(scaled);
  const upper = Math.min(stops.length - 1, lower + 1);
  const amount = scaled - lower;
  return [
    Math.round(stops[lower][0] + (stops[upper][0] - stops[lower][0]) * amount),
    Math.round(stops[lower][1] + (stops[upper][1] - stops[lower][1]) * amount),
    Math.round(stops[lower][2] + (stops[upper][2] - stops[lower][2]) * amount),
  ];
}

export default function GradCAMViewer({ report, imagePreview }: GradCAMViewerProps) {
  const { gradCamRegions, evidenceOverlayBase64, evidenceOverlayMediaType, attentionMapNorm } = report;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<"overlay" | "canvas">("overlay");

  useEffect(() => {
    if (!attentionMapNorm || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rows = attentionMapNorm.length;
    const cols = attentionMapNorm[0]?.length || 0;
    if (rows === 0 || cols === 0) return;

    const imgData = ctx.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const row = Math.floor((y * rows) / canvas.height);
        const col = Math.floor((x * cols) / canvas.width);
        const val = Number(attentionMapNorm[row]?.[col] || 0);
        const rgb = heatColor(val);
        const idx = (y * canvas.width + x) * 4;
        imgData.data[idx] = rgb[0];
        imgData.data[idx + 1] = rgb[1];
        imgData.data[idx + 2] = rgb[2];
        imgData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [attentionMapNorm, viewMode]);

  const hasLiveOverlay = Boolean(evidenceOverlayBase64);
  const hasLiveAttentionMap = Boolean(attentionMapNorm && attentionMapNorm.length > 0);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>
            {report.isLiveInference ? "Spatial Attention Evidence Map" : "Grad-CAM Attention Map"}
          </h3>
          <p className={styles.subtitle}>
            {report.isLiveInference
              ? "MATLAB R2026a Sparse-BagNet gated spatial attention highlighting diagnostic regions"
              : "Gradient-weighted Class Activation Mapping — highlights regions influencing DR classification"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {hasLiveAttentionMap && (
            <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "2px" }}>
              <button
                type="button"
                onClick={() => setViewMode("overlay")}
                style={{
                  padding: "4px 10px",
                  fontSize: "11px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: viewMode === "overlay" ? "#3b82f6" : "transparent",
                  color: viewMode === "overlay" ? "#fff" : "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Blended Overlay
              </button>
              <button
                type="button"
                onClick={() => setViewMode("canvas")}
                style={{
                  padding: "4px 10px",
                  fontSize: "11px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: viewMode === "canvas" ? "#3b82f6" : "transparent",
                  color: viewMode === "canvas" ? "#fff" : "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Raw Thermal (60×60)
              </button>
            </div>
          )}
          <span className="badge badge-purple">
            {report.isLiveInference ? "Live MATLAB Engine" : "Explainability Layer"}
          </span>
        </div>
      </div>

      <div className={styles.viewerGrid}>
        {/* Original image */}
        <div className={styles.imagePanel}>
          <div className={styles.panelLabel}>Original Fundus</div>
          <div className={styles.imageFrame}>
            <img src={imagePreview} alt="Original fundus" className={styles.img} />
            <div className={styles.frameCornerTL} />
            <div className={styles.frameCornerTR} />
            <div className={styles.frameCornerBL} />
            <div className={styles.frameCornerBR} />
          </div>
        </div>

        {/* Attention Map / Grad-CAM overlay */}
        <div className={styles.imagePanel}>
          <div className={styles.panelLabel}>
            {hasLiveOverlay
              ? viewMode === "canvas"
                ? "Raw Spatial Attention (Canvas)"
                : "Live Evidence Overlay (MATLAB)"
              : "Grad-CAM Overlay"}
          </div>
          <div className={styles.imageFrame} style={{ position: "relative" }}>
            {hasLiveOverlay ? (
              viewMode === "canvas" ? (
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={360}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <img
                  src={`data:${evidenceOverlayMediaType || "image/png"};base64,${evidenceOverlayBase64}`}
                  alt="Live Evidence Overlay"
                  className={styles.img}
                />
              )
            ) : (
              <>
                <img
                  src={imagePreview}
                  alt="Grad-CAM overlay"
                  className={styles.img}
                  style={{ filter: "brightness(0.6) saturate(0.5)" }}
                />
                {/* Heatmap blobs */}
                {gradCamRegions.map((region, i) => (
                  <div
                    key={i}
                    className={styles.heatBlob}
                    style={{
                      left: `${region.x}%`,
                      top: `${region.y}%`,
                      width: `${region.w}%`,
                      height: `${region.h}%`,
                      background: `radial-gradient(ellipse at center, ${region.color}${Math.round(region.intensity * 180).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
                {/* Hotspot markers */}
                {gradCamRegions.map((region, i) => (
                  <div
                    key={`marker-${i}`}
                    className={styles.hotspot}
                    style={{
                      left: `${region.x + region.w / 2}%`,
                      top: `${region.y + region.h / 2}%`,
                      borderColor: region.color,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  >
                    <span className={styles.hotspotPulse} style={{ background: region.color }} />
                  </div>
                ))}
                {gradCamRegions.length === 0 && (
                  <div className={styles.noHeatmap}>
                    <span>No significant activation regions detected</span>
                  </div>
                )}
              </>
            )}
            <div className={styles.frameCornerTL} />
            <div className={styles.frameCornerTR} />
            <div className={styles.frameCornerBL} />
            <div className={styles.frameCornerBR} />
          </div>
        </div>
      </div>

      {/* Legend */}
      {gradCamRegions.length > 0 && !hasLiveOverlay && (
        <div className={styles.legend}>
          <div className={styles.legendTitle}>Detected Attention Regions</div>
          <div className={styles.legendItems}>
            {gradCamRegions.map((r, i) => (
              <div key={i} className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: r.color }} />
                <span className={styles.legendLabel}>{r.label}</span>
                <span className={styles.legendIntensity}>{Math.round(r.intensity * 100)}%</span>
              </div>
            ))}
          </div>
          <div className={styles.colorScale}>
            <span className={styles.scaleLabel}>Low attention</span>
            <div className={styles.scaleBar} />
            <span className={styles.scaleLabel}>High attention</span>
          </div>
        </div>
      )}

      {hasLiveOverlay && (
        <div className={styles.legend}>
          <div className={styles.legendTitle}>Gated Attention Intensity Spectrum</div>
          <div className={styles.colorScale}>
            <span className={styles.scaleLabel}>Background / Unaffected</span>
            <div className={styles.scaleBar} />
            <span className={styles.scaleLabel}>High Diagnostic Activation</span>
          </div>
        </div>
      )}

      {/* Clinical note */}
      <div className={styles.clinicalNote}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>
          {report.isLiveInference
            ? "Spatial evidence maps are produced directly via 3,600 patch activations across the convolutional backbone in MATLAB R2026a. The heatmap highlights microvascular lesions and hemorrhages governing clinical severity score."
            : "Grad-CAM maps are generated from the final convolutional layer of RetinalNet-v3.2.1. Activation regions correlate with clinical lesion locations and should be reviewed by a qualified ophthalmologist."}{" "}
          Target review time: <strong>&lt;30 seconds</strong>.
        </p>
      </div>
    </div>
  );
}
