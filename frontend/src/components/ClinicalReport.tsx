"use client";
import { MockReport, DR_GRADE_CONFIG } from "@/lib/mockData";
import styles from "./ClinicalReport.module.css";

interface ClinicalReportProps {
  report: MockReport;
}

const GRADE_LABELS = [
  { grade: 0, label: "No DR" },
  { grade: 1, label: "Mild" },
  { grade: 2, label: "Moderate" },
  { grade: 3, label: "Severe" },
  { grade: 4, label: "PDR" },
];

export default function ClinicalReport({ report }: ClinicalReportProps) {
  const gradeConfig = DR_GRADE_CONFIG[report.drGrade];

  return (
    <div className={styles.wrapper}>
      {/* DR Severity Scale */}
      <div className={styles.scaleSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>International Clinical DR Severity Scale</h3>
          <span className="badge badge-info">ICDR 2002</span>
        </div>
        <div className={styles.gradeScale}>
          {GRADE_LABELS.map(({ grade, label }) => {
            const cfg = DR_GRADE_CONFIG[grade as keyof typeof DR_GRADE_CONFIG];
            const isActive = grade === report.drGrade;
            return (
              <div key={grade} className={`${styles.gradeStep} ${isActive ? styles.gradeStepActive : ""}`}>
                <div
                  className={styles.gradeCircle}
                  style={
                    isActive
                      ? { background: cfg.color, borderColor: cfg.color, boxShadow: `0 0 20px ${cfg.color}80` }
                      : grade < report.drGrade
                      ? { background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)" }
                      : { borderColor: "rgba(255,255,255,0.08)" }
                  }
                >
                  {isActive ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  ) : (
                    <span style={{ color: grade < report.drGrade ? "rgba(255,255,255,0.4)" : "var(--text-muted)" }}>
                      {grade}
                    </span>
                  )}
                </div>
                <div className={styles.gradeConnector} style={{ display: grade === 4 ? "none" : undefined }}>
                  <div
                    className={styles.gradeConnectorLine}
                    style={{ background: grade < report.drGrade ? cfg.color : "rgba(255,255,255,0.08)" }}
                  />
                </div>
                <span
                  className={styles.gradeStepLabel}
                  style={{ color: isActive ? cfg.color : "var(--text-muted)", fontWeight: isActive ? 700 : 400 }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance metrics */}
      <div className={styles.metricsGrid}>
        {[
          {
            label: "Sensitivity",
            value: `${report.sensitivity}%`,
            target: ">90%",
            met: report.sensitivity > 90,
            desc: "True Positive Rate for referable DR",
            color: "#3b82f6",
          },
          {
            label: "Specificity",
            value: `${report.specificity}%`,
            target: ">85%",
            met: report.specificity > 85,
            desc: "True Negative Rate for non-referable",
            color: "#6366f1",
          },
          {
            label: "AUC-ROC",
            value: report.auc.toFixed(3),
            target: ">0.95",
            met: report.auc > 0.95,
            desc: "Area under receiver operating curve",
            color: "#8b5cf6",
          },
          {
            label: "Processing Time",
            value: `${report.processingTime}s`,
            target: "<10s",
            met: report.processingTime < 10,
            desc: "End-to-end pipeline analysis time",
            color: "#06b6d4",
          },
        ].map((m, i) => (
          <div key={i} className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>{m.label}</span>
              <span
                className={styles.metricTarget}
                style={{ color: m.met ? "#22c55e" : "#f59e0b" }}
              >
                {m.met ? "✓" : "!"} {m.target}
              </span>
            </div>
            <div className={styles.metricValue} style={{ color: m.color }}>
              {m.value}
            </div>
            <div className={styles.metricDesc}>{m.desc}</div>
            <div className={styles.metricBar}>
              <div
                className={styles.metricBarFill}
                style={{
                  width: m.label === "AUC-ROC"
                    ? `${report.auc * 100}%`
                    : m.label === "Processing Time"
                    ? `${Math.max(0, 100 - (report.processingTime / 10) * 100)}%`
                    : `${parseFloat(m.value)}%`,
                  background: m.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 5-Class Probabilities Breakdown (Live ML Model) */}
      {report.probabilities && report.probabilities.length > 0 && (
        <div className={styles.qualitySection} style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 className={styles.subTitle} style={{ margin: 0 }}>Model Class Probabilities</h4>
            <span className="badge badge-info" style={{ fontSize: "11px" }}>Softmax Logits</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {report.probabilities.map((prob, idx) => {
              const cfg = DR_GRADE_CONFIG[idx as keyof typeof DR_GRADE_CONFIG];
              const pct = (Number(prob) * 100).toFixed(1);
              const isTop = idx === report.drGrade;
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px" }}>
                  <span style={{ width: "130px", fontWeight: isTop ? 700 : 400, color: isTop ? cfg?.color : "var(--text-secondary)" }}>
                    Level {idx}: {GRADE_LABELS[idx]?.label || `Class ${idx}`}
                  </span>
                  <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: isTop ? cfg?.color || "#22c55e" : "#3b82f6",
                        borderRadius: "4px",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                  <span style={{ width: "50px", textAlign: "right", fontWeight: 600, color: isTop ? cfg?.color || "#22c55e" : "var(--text-muted)", fontSize: "12px" }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image quality */}
      <div className={styles.qualitySection}>
        <h4 className={styles.subTitle}>Image Quality Assessment</h4>
        <div className={styles.qualityGrid}>
          <div className={styles.qualityScore}>
            <div className={styles.qualityScoreValue}>{report.imageQuality.score}</div>
            <div className={styles.qualityScoreLabel}>Overall</div>
            <div className={styles.qualityGrade} style={{
              color: report.imageQuality.grade === "Excellent" ? "#22c55e" :
                report.imageQuality.grade === "Good" ? "#84cc16" :
                report.imageQuality.grade === "Adequate" ? "#f59e0b" : "#ef4444"
            }}>
              {report.imageQuality.grade}
            </div>
          </div>
          <div className={styles.qualityBars}>
            {[
              { label: "Focus Score", value: report.imageQuality.focusScore },
              { label: "Illumination", value: report.imageQuality.illuminationScore },
              { label: "Field of View", value: report.imageQuality.fieldOfViewScore },
            ].map((q, i) => (
              <div key={i} className={styles.qualityBarRow}>
                <span className={styles.qualityBarLabel}>{q.label}</span>
                <div className={styles.qualityBarTrack}>
                  <div
                    className={styles.qualityBarFill}
                    style={{
                      width: `${q.value}%`,
                      background: q.value >= 85 ? "#22c55e" : q.value >= 70 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
                <span className={styles.qualityBarValue}>{q.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clinical recommendation */}
      <div
        className={styles.recommendationBox}
        style={{
          borderColor: gradeConfig.border,
          background: gradeConfig.bg,
        }}
      >
        <div className={styles.recHeader}>
          <div className={styles.recIcon} style={{ color: gradeConfig.color }}>
            {report.referable ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
          </div>
          <div>
            <div className={styles.recTitle} style={{ color: gradeConfig.color }}>
              Clinical Recommendation
            </div>
            <div className={styles.recTimeline}>
              Follow-up: {report.followUpTimeline}
            </div>
          </div>
        </div>
        <p className={styles.recText}>{report.clinicalRecommendation}</p>
      </div>

      {/* Technical notes */}
      <div className={styles.techNotes}>
        <div className={styles.techNoteHeader}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12,8 12,12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Technical Notes
        </div>
        <p className={styles.techNoteText}>{report.notes}</p>
        <div className={styles.techNoteFooter}>
          <span>Dataset: {report.validationDataset}</span>
          <span>•</span>
          <span>Model: {report.modelVersion}</span>
          <span>•</span>
          <span className={styles.disclaimer}>For research/screening use only. Not a substitute for ophthalmologist diagnosis.</span>
        </div>
      </div>
    </div>
  );
}
