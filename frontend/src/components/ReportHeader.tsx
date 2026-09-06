"use client";
import { MockReport, DR_GRADE_CONFIG } from "@/lib/mockData";
import styles from "./ReportHeader.module.css";

interface ReportHeaderProps {
  report: MockReport;
}

export default function ReportHeader({ report }: ReportHeaderProps) {
  const gradeConfig = DR_GRADE_CONFIG[report.drGrade];

  return (
    <div className={styles.header}>
      {/* Brand + meta */}
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <ellipse cx="16" cy="16" rx="13" ry="9" stroke="url(#bgi)" strokeWidth="2" fill="none"/>
              <circle cx="16" cy="16" r="5" stroke="url(#bgi)" strokeWidth="2" fill="none"/>
              <circle cx="16" cy="16" r="2" fill="url(#bgi)"/>
              <defs>
                <linearGradient id="bgi" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div className={styles.brandName}>RetinaAI</div>
            <div className={styles.brandSub}>Diabetic Retinopathy Screening System</div>
          </div>
        </div>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Report ID</span>
            <span className={styles.metaValue}>{report.patientId}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Date</span>
            <span className={styles.metaValue}>{report.analysisDate}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Time</span>
            <span className={styles.metaValue}>{report.analysisTime}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Eye</span>
            <span className={styles.metaValue}>{report.eye}</span>
          </div>
        </div>
      </div>

      {/* Patient info + verdict */}
      <div className={styles.mainContent}>
        {/* Patient info */}
        <div className={styles.patientCard}>
          <div className={styles.patientAvatar}>
            <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
              <circle cx="20" cy="15" r="7" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.4)" strokeWidth="1.5"/>
              <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="rgba(59,130,246,0.4)" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div>
            <div className={styles.patientName}>{report.patientName}</div>
            <div className={styles.patientDetails}>
              {report.age} yrs • {report.gender} • DM: {report.diabetesDuration}
            </div>
            <div className={styles.patientCentre}>{report.referringCentre}</div>
          </div>
        </div>

        {/* DR Verdict */}
        <div
          className={styles.verdictCard}
          style={{
            background: gradeConfig.bg,
            borderColor: gradeConfig.border,
          }}
        >
          <div className={styles.verdictLeft}>
            <div className={styles.gradeLabel}>DR Grade</div>
            <div className={styles.gradeLevel} style={{ color: gradeConfig.color }}>
              Level {report.drGrade}
            </div>
            <div className={styles.gradeTitle}>{report.drGradeLabel}</div>
          </div>
          <div className={styles.verdictRight}>
            <div
              className={styles.referralBadge}
              style={
                report.referable
                  ? { background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.4)", color: "#f87171" }
                  : { background: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.4)", color: "#34d399" }
              }
            >
              <span className={styles.referralDot} style={{ background: report.referable ? "#ef4444" : "#10b981" }} />
              {report.referable ? "REFER TO OPHTHALMOLOGIST" : "NO REFERRAL REQUIRED"}
            </div>
            <div className={styles.urgencyBadge} style={{ color: gradeConfig.color }}>
              ⏱ Follow-up: {gradeConfig.urgency}
            </div>
            <div className={styles.confidenceRow}>
              <span className={styles.confidenceLabel}>AI Confidence</span>
              <div className={styles.confidenceBar}>
                <div
                  className={styles.confidenceFill}
                  style={{ width: `${report.confidence}%`, background: gradeConfig.color }}
                />
              </div>
              <span className={styles.confidenceValue} style={{ color: gradeConfig.color }}>
                {report.confidence}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
