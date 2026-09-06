"use client";
import { MockReport, DR_GRADE_CONFIG } from "@/lib/mockData";
import { DoctorProfile, PRESET_DOCTORS } from "./DoctorLoginModal";
import styles from "./FinalDecision.module.css";

interface FinalDecisionProps {
  report: MockReport;
  decision: "approved" | "flagged" | "rejected";
  doctorNote: string;
  finalGrade?: number;
  isOverridden?: boolean;
  doctor?: DoctorProfile;
  onNewScan: () => void;
  onBackToReport?: () => void;
}

export default function FinalDecision({
  report,
  decision,
  doctorNote,
  finalGrade,
  isOverridden = false,
  doctor = PRESET_DOCTORS[0],
  onNewScan,
  onBackToReport,
}: FinalDecisionProps) {
  const isApproved = decision === "approved";
  const isRejected = decision === "rejected";
  const effectiveGrade = finalGrade !== undefined ? finalGrade : report.drGrade;
  const gradeConfig = DR_GRADE_CONFIG[effectiveGrade as keyof typeof DR_GRADE_CONFIG] || DR_GRADE_CONFIG[report.drGrade];
  const aiGradeConfig = DR_GRADE_CONFIG[report.drGrade];

  const timestamp = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
  });

  const referralCode = `REF-${report.patientId.slice(-6)}-${Date.now().toString(36).toUpperCase().slice(-4)}`;

  const accentColor = isApproved ? "#34d399" : isRejected ? "#f87171" : "#fbbf24";

  return (
    <div className={styles.container}>
      {/* Confetti / glow burst */}
      <div
        className={`${styles.burstGlow} ${
          isApproved ? styles.burstGreen : styles.burstRed
        }`}
      />

      {/* Icon */}
      <div
        className={`${styles.iconRing} ${
          isApproved ? styles.iconRingGreen : styles.iconRingRed
        }`}
      >
        <div
          className={styles.iconPulse}
          style={{
            background: isApproved
              ? "rgba(16,185,129,0.15)"
              : isRejected
              ? "rgba(239,68,68,0.15)"
              : "rgba(245,158,11,0.15)",
          }}
        />
        {isApproved ? (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        ) : isRejected ? (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
      </div>

      {/* Heading */}
      <div className={styles.heading}>
        <h2 className={styles.title} style={{ color: accentColor }}>
          {isApproved
            ? "Doctor Final Clinical Sign-Off: Approved"
            : isRejected
            ? "AI Classification Rejected by Doctor"
            : "Flagged for Specialist Referral"}
        </h2>
        <p className={styles.subtitle}>
          {isApproved
            ? isOverridden
              ? `Doctor ${doctor.name} exercised clinical override and signed off on Level ${effectiveGrade} DR.`
              : `Doctor ${doctor.name} reviewed and confirmed the AI classification and diagnostic findings.`
            : isRejected
            ? `Doctor ${doctor.name} reviewed and rejected the AI model recommendation. Case logged for senior clinician examination.`
            : `Patient has been escalated for urgent specialist consultation at tertiary ophthalmic centre.`}
        </p>
      </div>

      {/* Decision card */}
      <div className={styles.decisionCard}>
        <div className={styles.decisionGrid}>
          {/* Patient */}
          <div className={styles.decField}>
            <span className={styles.decLabel}>Patient</span>
            <span className={styles.decValue}>{report.patientName} ({report.patientId})</span>
          </div>

          {/* AI Initial Assessment */}
          <div className={styles.decField}>
            <span className={styles.decLabel}>AI Initial Grade</span>
            <span className={styles.decValue} style={{ color: aiGradeConfig.color }}>
              Level {report.drGrade} — {report.drGradeLabel} ({report.confidence}%)
            </span>
          </div>

          {/* Doctor Final Grade */}
          <div className={styles.decField}>
            <span className={styles.decLabel}>Doctor Assigned Grade</span>
            <span className={styles.decValueBold} style={{ color: gradeConfig.color }}>
              Level {effectiveGrade} — {gradeConfig.label}
              {isOverridden && (
                <span style={{ fontSize: 11, marginLeft: 6, color: "#f59e0b", background: "rgba(245,158,11,0.15)", padding: "1px 6px", borderRadius: 4 }}>
                  OVERRIDDEN
                </span>
              )}
            </span>
          </div>

          {/* Final Decision */}
          <div className={styles.decField}>
            <span className={styles.decLabel}>Clinical Verdict</span>
            <span className={styles.decValueBold} style={{ color: accentColor }}>
              {isApproved
                ? "✓ ACCEPTED & APPROVED"
                : isRejected
                ? "✕ REJECTED BY DOCTOR"
                : "⚠ FLAGGED FOR REFERRAL"}
            </span>
          </div>

          {/* Clinician */}
          <div className={styles.decField}>
            <span className={styles.decLabel}>Reviewed By</span>
            <span className={styles.decValue}>{doctor.name} • {doctor.designation}</span>
            <span className={styles.decValueMono} style={{ fontSize: 11 }}>{doctor.id} • {doctor.hospital}</span>
          </div>

          {/* Timestamp */}
          <div className={styles.decField}>
            <span className={styles.decLabel}>Audit Timestamp</span>
            <span className={styles.decValueMono}>{timestamp}</span>
          </div>

          {!isApproved && (
            <div className={styles.decField} style={{ gridColumn: "1 / -1" }}>
              <span className={styles.decLabel}>Electronic Case / Referral Code</span>
              <span className={styles.decValueMono} style={{ color: "#f59e0b", fontSize: 15, fontWeight: 700 }}>
                {referralCode}
              </span>
            </div>
          )}
        </div>

        {/* Doctor note */}
        {doctorNote && (
          <div className={styles.noteBox}>
            <div className={styles.noteLabel}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Doctor&apos;s Clinical Sign-Off Notes
            </div>
            <p className={styles.noteText}>{doctorNote}</p>
          </div>
        )}
      </div>

      {/* Follow-up action */}
      <div
        className={styles.actionBox}
        style={
          isApproved
            ? { background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.2)" }
            : isRejected
            ? { background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }
            : { background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.2)" }
        }
      >
        <div className={styles.actionIcon} style={{ color: accentColor }}>
          {isApproved ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          ) : isRejected ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          )}
        </div>
        <div>
          <div className={styles.actionTitle} style={{ color: accentColor }}>
            {isApproved
              ? `Recommended Action: ${report.followUpTimeline}`
              : isRejected
              ? `CASE REJECTED — Senior Clinical Review Required`
              : `URGENT ACTION — Immediate Referral`}
          </div>
          <div className={styles.actionDesc}>
            {isApproved
              ? report.clinicalRecommendation
              : isRejected
              ? `The AI output was rejected by ${doctor.name}. Case has been dispatched to senior ophthalmologist queue for manual slit-lamp & dilated examination.`
              : `Tele-ophthalmology referral ticket dispatched to tertiary center. Patient scheduled for slit lamp & fluorescein angiography examination.`}
          </div>
        </div>
      </div>

      {/* Audit trail note */}
      <div className={styles.auditNote}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>
          Clinically authenticated by <strong>{doctor.name} ({doctor.id})</strong> in accordance with National Tele-retinopathy Guidelines.
        </span>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {onBackToReport && (
          <button className="btn-secondary" onClick={onBackToReport}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View Full Report
          </button>
        )}
        <button className="btn-secondary" onClick={() => window.print()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 6,2 18,2 18,9"/>
            <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print Sign-Off PDF
        </button>
        <button id="btn-new-scan-final" className="btn-primary" onClick={onNewScan}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="1,4 1,10 7,10"/>
            <path d="M3.51,15a9,9,0,1,0,.49-8"/>
          </svg>
          Next Patient Scan
        </button>
      </div>
    </div>
  );
}
