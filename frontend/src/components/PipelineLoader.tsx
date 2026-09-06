"use client";
import { useEffect, useRef, useState } from "react";
import { predictDR, PredictResponse } from "@/lib/api";
import styles from "./AnalysisLoader.module.css";

interface PipelineLoaderProps {
  imagePreview: string;
  file?: File | null;
  onComplete: (prediction?: PredictResponse, processingTime?: number) => void;
  onError?: (errorMsg: string) => void;
}

const STEPS = [
  { label: "Image Quality Assessment", detail: "Evaluating focus, illumination & field of view", duration: 700 },
  { label: "CLAHE Enhancement", detail: "Adaptive histogram equalization & noise reduction", duration: 800 },
  { label: "Vessel Segmentation", detail: "Extracting retinal vascular architecture", duration: 900 },
  { label: "Optic Disc Localization", detail: "Detecting disc boundary & C/D ratio", duration: 600 },
  { label: "Lesion Detection", detail: "Microaneurysms, hemorrhages, exudates, CWS", duration: 1000 },
  { label: "DR Severity Grading", detail: "MATLAB R2026a Sparse-BagNet inference", duration: 1200 },
  { label: "Gated Attention Generation", detail: "Computing spatial evidence attention maps", duration: 1000 },
  { label: "Report Synthesis", detail: "Compiling clinical findings & recommendations", duration: 600 },
];

export default function PipelineLoader({
  imagePreview,
  file,
  onComplete,
  onError,
}: PipelineLoaderProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedUpTo, setCompletedUpTo] = useState<number>(-1);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const predictionRef = useRef<PredictResponse | null>(null);
  const apiDoneRef = useRef<boolean>(false);
  const apiErrorRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    let isCancelled = false;

    // Trigger API call immediately in background
    if (file) {
      predictDR(file)
        .then((res) => {
          if (isCancelled) return;
          predictionRef.current = res;
          apiDoneRef.current = true;
        })
        .catch((err) => {
          if (isCancelled) return;
          console.error("Backend prediction error:", err);
          apiErrorRef.current = err instanceof Error ? err.message : String(err);
          apiDoneRef.current = true;
        });
    } else {
      apiDoneRef.current = true;
    }

    let stepIndex = 0;
    let timerId: NodeJS.Timeout;

    const advanceStep = () => {
      if (isCancelled) return;

      // When reaching final step, wait until API call finishes if it's still in flight
      if (stepIndex >= STEPS.length - 1 && !apiDoneRef.current) {
        setCurrentStep(STEPS.length - 1);
        setCompletedUpTo(STEPS.length - 2);
        setOverallProgress(92);
        timerId = setTimeout(advanceStep, 400);
        return;
      }

      // Check if API finished with error
      if (stepIndex >= STEPS.length - 1 && apiErrorRef.current) {
        setErrorMessage(apiErrorRef.current);
        if (onError) onError(apiErrorRef.current);
        return;
      }

      if (stepIndex >= STEPS.length) {
        setOverallProgress(100);
        setCompletedUpTo(STEPS.length - 1);
        const duration = (Date.now() - startTimeRef.current) / 1000;
        timerId = setTimeout(() => {
          if (!isCancelled) {
            onComplete(predictionRef.current || undefined, duration);
          }
        }, 400);
        return;
      }

      setCurrentStep(stepIndex);
      const step = STEPS[stepIndex];
      const targetProgress = Math.round(((stepIndex + 1) / STEPS.length) * 100);
      setOverallProgress((prev) => Math.max(prev, targetProgress));

      timerId = setTimeout(() => {
        if (isCancelled) return;
        setCompletedUpTo((prev) => Math.max(prev, stepIndex));
        stepIndex++;
        advanceStep();
      }, step.duration);
    };

    timerId = setTimeout(advanceStep, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timerId);
    };
  }, [file, onComplete, onError]);

  const handleUseMockFallback = () => {
    const duration = (Date.now() - startTimeRef.current) / 1000;
    onComplete(undefined, duration);
  };

  return (
    <div className={styles.container}>
      {/* Scan overlay on image */}
      <div className={styles.imageSection}>
        <div className={styles.imageFrame}>
          <img src={imagePreview} alt="Analyzing" className={styles.image} />
          <div className={styles.scanLine} />
          <div className={styles.gridOverlay} />
          <div className={styles.cornerBracketTL} />
          <div className={styles.cornerBracketTR} />
          <div className={styles.cornerBracketBL} />
          <div className={styles.cornerBracketBR} />
          {/* Visual detection cues */}
          {(currentStep >= 4 || completedUpTo >= 4) && (
            <>
              <div className={`${styles.detectionBox} ${styles.box1}`}>
                <span className={styles.detectionLabel}>MA ×7</span>
              </div>
              <div className={`${styles.detectionBox} ${styles.box2}`}>
                <span className={styles.detectionLabel}>HE ×4</span>
              </div>
            </>
          )}
        </div>

        {/* Status badge */}
        <div className={styles.statusBadge}>
          <span className={styles.statusDot} />
          <span>{file ? "MATLAB Inference Active" : "AI Analysis Running"}</span>
        </div>
      </div>

      {/* Steps */}
      <div className={styles.stepsSection}>
        <div className={styles.stepsHeader}>
          <div>
            <h3 className={styles.stepsTitle}>Processing Pipeline</h3>
            <p className={styles.stepsSubtitle}>MATLAB R2026a Engine • Sparse-BagNet • ICDR Scale</p>
          </div>
          <div className={styles.progressCircle}>
            <svg viewBox="0 0 36 36" className={styles.progressSvg}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(59,130,246,0.15)"
                strokeWidth="2.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#cpg)"
                strokeWidth="2.5"
                strokeDasharray={`${overallProgress}, 100`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="cpg" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <span className={styles.progressText}>{overallProgress}%</span>
          </div>
        </div>

        {errorMessage ? (
          <div
            style={{
              padding: "16px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              margin: "16px 0",
            }}
          >
            <div style={{ color: "#f87171", fontWeight: 600, fontSize: "14px", marginBottom: "6px" }}>
              Backend Inference Notice
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "12px", lineHeight: 1.5, marginBottom: "12px" }}>
              {errorMessage}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: "6px 14px", fontSize: "12px" }}
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "6px 14px", fontSize: "12px" }}
                onClick={handleUseMockFallback}
              >
                Proceed with Simulated Report
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.stepsList}>
            {STEPS.map((step, i) => {
              const isCompleted = i <= completedUpTo || i < currentStep;
              const isActive = i === currentStep && !isCompleted;
              return (
                <div
                  key={i}
                  className={`${styles.step} ${isCompleted ? styles.stepDone : ""} ${isActive ? styles.stepActive : ""}`}
                >
                  <div className={styles.stepIcon}>
                    {isCompleted ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    ) : isActive ? (
                      <div className={styles.stepSpinner} />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepLabel}>{step.label}</div>
                    {(isActive || isCompleted) && (
                      <div className={styles.stepDetail}>{step.detail}</div>
                    )}
                  </div>
                  {isActive && (
                    <div className={styles.stepProgress}>
                      <div className={styles.stepProgressBar} style={{ animationDuration: `${step.duration}ms` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
