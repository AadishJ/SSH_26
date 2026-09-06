"use client";
import { MockReport } from "@/lib/mockData";
import styles from "./LesionTable.module.css";

interface LesionTableProps {
  report: MockReport;
}

const SEVERITY_CONFIG = {
  none: { label: "None", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
  mild: { label: "Mild", color: "#84cc16", bg: "rgba(132,204,22,0.1)", border: "rgba(132,204,22,0.25)" },
  moderate: { label: "Moderate", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  severe: { label: "Severe", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
};

export default function LesionTable({ report }: LesionTableProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Lesion Detection Results</h3>
          <p className={styles.sectionSubtitle}>Sub-pixel microaneurysm detection • Automated lesion-level evidence</p>
        </div>
        <div className={styles.modelBadge}>
          <span className={styles.modelDot} />
          <span>Model: {report.modelVersion}</span>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Lesion Type</th>
              <th>Count</th>
              <th>Severity</th>
              <th>Location</th>
              <th>Clinical Significance</th>
            </tr>
          </thead>
          <tbody>
            {report.lesionFindings.map((finding, i) => {
              const sev = SEVERITY_CONFIG[finding.severity];
              return (
                <tr
                  key={i}
                  className={styles.row}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <td>
                    <div className={styles.lesionName}>
                      <span className={styles.lesionIcon}>{finding.icon}</span>
                      <span>{finding.type}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.countValue}>{finding.count}</span>
                  </td>
                  <td>
                    <span
                      className={styles.severityPill}
                      style={{ background: sev.bg, borderColor: sev.border, color: sev.color }}
                    >
                      {sev.label}
                    </span>
                  </td>
                  <td>
                    <span className={styles.location}>{finding.location}</span>
                  </td>
                  <td>
                    <span className={styles.significance}>{finding.clinicalSignificance}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Structural findings */}
      <div className={styles.structuralSection}>
        <h4 className={styles.subTitle}>Structural Analysis</h4>
        <div className={styles.structuralGrid}>
          {report.structuralFindings.map((sf, i) => {
            const isNormal = sf.status === "Normal";
            const isCritical = sf.status === "Critical";
            const isAbnormal = sf.status === "Abnormal";
            const isAtRisk = sf.status === "At Risk";
            return (
              <div
                key={i}
                className={styles.structCard}
                style={{
                  borderColor: isCritical ? "rgba(239,68,68,0.35)" : isAbnormal ? "rgba(249,115,22,0.3)" : isAtRisk ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.2)",
                  background: isCritical ? "rgba(239,68,68,0.05)" : isAbnormal ? "rgba(249,115,22,0.05)" : isAtRisk ? "rgba(245,158,11,0.05)" : "rgba(34,197,94,0.03)",
                }}
              >
                <div className={styles.structHeader}>
                  <span className={styles.structName}>{sf.structure}</span>
                  <span
                    className={styles.structStatus}
                    style={{
                      color: isCritical ? "#f87171" : isAbnormal ? "#fb923c" : isAtRisk ? "#fbbf24" : "#4ade80",
                    }}
                  >
                    {sf.status}
                  </span>
                </div>
                {sf.measurement && (
                  <div className={styles.structMeasurement}>{sf.measurement}</div>
                )}
                <div className={styles.structNote}>{sf.note}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
