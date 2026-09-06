"use client";
import { useCallback, useState } from "react";
import styles from "./UploadZone.module.css";

interface UploadZoneProps {
  onImageSelect: (file: File, preview: string) => void;
}

export default function UploadZone({ onImageSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelect(file, e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      id="upload-zone"
      className={`${styles.zone} ${isDragging ? styles.dragging : ""}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        id="file-input"
        type="file"
        accept="image/*"
        className={styles.input}
        onChange={handleChange}
      />

      {/* Animated corner brackets */}
      <span className={`${styles.corner} ${styles.cornerTL}`} />
      <span className={`${styles.corner} ${styles.cornerTR}`} />
      <span className={`${styles.corner} ${styles.cornerBL}`} />
      <span className={`${styles.corner} ${styles.cornerBR}`} />

      <div className={styles.content}>
        {/* Eye icon */}
        <div className={styles.iconWrap}>
          <div className={styles.iconRing} />
          <div className={styles.iconRing2} />
          <svg
            className={styles.eyeIcon}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="32" cy="32" rx="28" ry="20" stroke="url(#eg)" strokeWidth="2.5" fill="none" />
            <circle cx="32" cy="32" r="10" stroke="url(#eg)" strokeWidth="2.5" fill="none" />
            <circle cx="32" cy="32" r="4" fill="url(#eg)" />
            <circle cx="36" cy="28" r="2" fill="rgba(255,255,255,0.6)" />
            <defs>
              <linearGradient id="eg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h3 className={styles.title}>Upload Fundus Image</h3>
        <p className={styles.subtitle}>
          Drag & drop your retinal fundus photograph here, or{" "}
          <label htmlFor="file-input" className={styles.browseLink}>
            browse files
          </label>
        </p>

        <div className={styles.formats}>
          {["PNG", "JPG", "TIFF", "BMP", "WebP"].map((f) => (
            <span key={f} className={styles.formatTag}>{f}</span>
          ))}
        </div>

        <div className={styles.infoRow}>
          <div className={styles.infoItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
            </svg>
            <span>Analysis in ~4 seconds</span>
          </div>
          <div className={styles.infoItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>HIPAA-compliant processing</span>
          </div>
          <div className={styles.infoItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
            <span>RetinalNet-v3.2.1</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "12px" }}>
          <label htmlFor="file-input" className="btn-primary" style={{ cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="16,16 12,12 8,16" /><line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39,18.39A5,5,0,0,0,18,9h-1.26A8,8,0,1,0,3,16.3" />
            </svg>
            Select Fundus Image
          </label>

          <button
            type="button"
            className="btn-secondary"
            id="btn-load-sample"
            onClick={() => {
              // Generate realistic synthetic fundus photograph canvas
              const canvas = document.createElement("canvas");
              canvas.width = 512;
              canvas.height = 512;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                // Outer black border
                ctx.fillStyle = "#05070a";
                ctx.fillRect(0, 0, 512, 512);

                // Circular retina
                const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 230);
                grad.addColorStop(0, "#d9532f");
                grad.addColorStop(0.5, "#a83218");
                grad.addColorStop(0.85, "#611b0e");
                grad.addColorStop(1, "#1a0603");

                ctx.beginPath();
                ctx.arc(256, 256, 226, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                // Optic disc (yellowish-white oval on the nasal side)
                const discGrad = ctx.createRadialGradient(160, 240, 5, 160, 240, 36);
                discGrad.addColorStop(0, "#fff5cc");
                discGrad.addColorStop(0.6, "#fcd34d");
                discGrad.addColorStop(1, "#b45309");
                ctx.beginPath();
                ctx.ellipse(160, 240, 32, 40, 0.1, 0, Math.PI * 2);
                ctx.fillStyle = discGrad;
                ctx.fill();

                // Fovea / Macula (darker spot temporal side)
                const foveaGrad = ctx.createRadialGradient(330, 250, 4, 330, 250, 45);
                foveaGrad.addColorStop(0, "#3b0e06");
                foveaGrad.addColorStop(0.5, "#571609");
                foveaGrad.addColorStop(1, "transparent");
                ctx.beginPath();
                ctx.arc(330, 250, 45, 0, Math.PI * 2);
                ctx.fillStyle = foveaGrad;
                ctx.fill();

                // Retinal blood vessels branching from optic disc
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = "#450a0a";
                const vessels = [
                  [[160, 240], [180, 180], [210, 130], [250, 90], [310, 70]],
                  [[160, 240], [170, 190], [190, 150], [220, 110]],
                  [[160, 240], [180, 300], [210, 350], [260, 390], [320, 420]],
                  [[160, 240], [150, 300], [140, 360], [130, 410]],
                  [[160, 240], [130, 190], [100, 150], [70, 120]],
                  [[160, 240], [210, 235], [260, 230], [300, 235]],
                ];
                vessels.forEach((path) => {
                  ctx.beginPath();
                  ctx.moveTo(path[0][0], path[0][1]);
                  for (let i = 1; i < path.length; i++) {
                    ctx.lineTo(path[i][0], path[i][1]);
                  }
                  ctx.stroke();
                });

                // Microaneurysms & exudates
                ctx.fillStyle = "#ef4444";
                [
                  [280, 210, 3], [295, 230, 2.5], [310, 190, 3], [240, 270, 2], [340, 280, 2.5]
                ].forEach(([x, y, r]) => {
                  ctx.beginPath();
                  ctx.arc(x, y, r, 0, Math.PI * 2);
                  ctx.fill();
                });

                // Hard exudates (bright yellow flecks)
                ctx.fillStyle = "#fef08a";
                [
                  [315, 220, 3], [322, 224, 2], [328, 218, 2.5], [350, 240, 3]
                ].forEach(([x, y, r]) => {
                  ctx.beginPath();
                  ctx.arc(x, y, r, 0, Math.PI * 2);
                  ctx.fill();
                });

                const dataUrl = canvas.toDataURL("image/png");
                fetch(dataUrl)
                  .then((res) => res.blob())
                  .then((blob) => {
                    const mockFile = new File([blob], "fundus_sample_OD.png", { type: "image/png" });
                    onImageSelect(mockFile, dataUrl);
                  });
              }
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Load Sample Patient Scan
          </button>
        </div>
      </div>
    </div>
  );
}

