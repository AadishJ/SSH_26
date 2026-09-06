"use client";
import { useState } from "react";
import { MockReport, DR_GRADE_CONFIG } from "@/lib/mockData";
import GradCAMViewer from "./GradCAMViewer";
import { DoctorProfile, PRESET_DOCTORS } from "./DoctorLoginModal";
import styles from "./DoctorReview.module.css";

interface DoctorReviewProps {
  report: MockReport;
  imagePreview: string;
  doctor?: DoctorProfile;
  onDecision: (
    decision: "approved" | "flagged" | "rejected",
    note: string,
    finalGrade: number,
    isOverridden: boolean
  ) => void;
  onClose?: () => void;
}

const GRADE_OPTIONS = [
  { grade: 0, label: "No DR", desc: "No microaneurysms or hemorrhages" },
  { grade: 1, label: "Mild NPDR", desc: "Microaneurysms only" },
  { grade: 2, label: "Moderate NPDR", desc: "More than microaneurysms, less than severe" },
  { grade: 3, label: "Severe NPDR", desc: ">20 hemorrhages / venous beading / IRMA" },
  { grade: 4, label: "Proliferative DR", desc: "Neovascularization / vitreous hemorrhage" },
];

export default function DoctorReview({
  report,
  imagePreview,
  doctor = PRESET_DOCTORS[0],
  onDecision,
  onClose,
}: DoctorReviewProps) {
  const [overrideMode, setOverrideMode] = useState<"confirm" | "override">("confirm");
  const [selectedGrade, setSelectedGrade] = useState<number>(report.drGrade);
  const [note, setNote] = useState("");
  const [hovering, setHovering] = useState<"approve" | "flag" | "reject" | null>(null);

  const gradeConfig = DR_GRADE_CONFIG[report.drGrade];
  const isOverridden = overrideMode === "override" && selectedGrade !== report.drGrade;

  const handleDecision = (decision: "approved" | "flagged" | "rejected") => {
    let defaultNote = "";
    if (decision === "approved") {
      defaultNote = isOverridden
        ? `Doctor override applied: Final grade assigned Level ${selectedGrade} (${GRADE_OPTIONS[selectedGrade]?.label}). Diagnosis confirmed by ${doctor.name}.`
        : `AI classification (Level ${report.drGrade}) independently confirmed by reviewing doctor ${doctor.name}.`;
    } else if (decision === "rejected") {
      defaultNote = isOverridden
        ? `Doctor ${doctor.name} rejected AI diagnosis (Level ${report.drGrade}) and reassigned to Level ${selectedGrade}.`
        : `Doctor ${doctor.name} rejected AI classification (Level ${report.drGrade}). Marked for manual clinical re-triage.`;
    } else {
      defaultNote = isOverridden
        ? `Flagged for specialist referral with doctor-assigned Level ${selectedGrade}.`
        : `Flagged for urgent referral to vitreoretinal specialist.`;
    }

    onDecision(decision, note || defaultNote, selectedGrade, isOverridden);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        {/* Header bar */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.doctorBadge}>
              <div className={styles.doctorAvatar}>{doctor.avatar}</div>
              <div>
                <div className={styles.doctorName}>{doctor.name}</div>
                <div className={styles.doctorDesig}>
                  {doctor.designation} • {doctor.hospital} ({doctor.id})
                </div>
              </div>
            </div>
            <div className={styles.reviewTag}>
              <span className={styles.reviewTagDot} />
              Human-in-the-Loop Review
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 12,
                color: "#60a5fa",
                background: "rgba(59, 130, 246, 0.12)",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                padding: "6px 14px",
                borderRadius: "20px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#3b82f6",
                  boxShadow: "0 0 8px #3b82f6",
                }}
              />
              Clinical Decision Console
            </span>

            {onClose && (
              <button
                onClick={onClose}
                className="btn-secondary"
                style={{ padding: "8px 14px", fontSize: 13 }}
                title="Return to report view"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Doctor Autonomy Banner */}
        <div className={styles.autonomyBanner}>
          <span className={styles.autonomyBadge}>Doctor Autonomy</span>
          <span>
            <strong>Final decision rests with the doctor:</strong> The AI model (RetinalNet-v3.2.1) provides real-time decision-support. As the reviewing ophthalmologist, you have full authority to accept the AI grade, override it, or reject the recommendation.
          </span>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* AI Summary card */}
          <div className={styles.aiSummaryCard} style={{ borderColor: gradeConfig.border, background: gradeConfig.bg }}>
            <div className={styles.aiSummaryHeader}>
              <div className={styles.aiLabel}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
                AI Classification — RetinalNet-v3.2.1
              </div>
              <div className={styles.confidencePill} style={{ color: gradeConfig.color, borderColor: gradeConfig.border, background: gradeConfig.bg }}>
                {report.confidence}% confidence
              </div>
            </div>

            <div className={styles.aiGradeRow}>
              <div>
                <div className={styles.aiGradeNumber} style={{ color: gradeConfig.color }}>
                  Level {report.drGrade}
                </div>
                <div className={styles.aiGradeTitle}>{report.drGradeLabel}</div>
                <div className={styles.aiPatient}>
                  {report.patientName} • {report.age}y • {report.eye}
                </div>
              </div>
              <div className={styles.aiMetrics}>
                {[
                  { label: "Sensitivity", val: `${report.sensitivity}%` },
                  { label: "Specificity", val: `${report.specificity}%` },
                  { label: "AUC", val: report.auc.toFixed(3) },
                ].map((m) => (
                  <div key={m.label} className={styles.aiMetricItem}>
                    <span className={styles.aiMetricVal}>{m.val}</span>
                    <span className={styles.aiMetricLabel}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence bar */}
            <div className={styles.confBarWrap}>
              <div className={styles.confBarLabel}>Model Confidence Score</div>
              <div className={styles.confBarTrack}>
                <div className={styles.confBarFill} style={{ width: `${report.confidence}%`, background: gradeConfig.color }} />
              </div>
              <span className={styles.confBarVal}>{report.confidence}%</span>
            </div>

            {/* Key lesions */}
            <div className={styles.keyLesions}>
              {report.lesionFindings.filter(l => l.severity !== "none").slice(0, 4).map((l, i) => (
                <div key={i} className={styles.lesionChip}>
                  <span>{l.icon}</span>
                  <span>{l.type}</span>
                  <span className={styles.lesionCount}>{l.count} detected</span>
                </div>
              ))}
            </div>

            {/* Quick Mock Accept / Reject Verdict Bar */}
            <div className={styles.quickVerdictBar}>
              <div className={styles.quickVerdictLabel}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Quick Doctor Verdict:
              </div>
              <div className={styles.quickVerdictBtns}>
                <button
                  id="btn-mock-reject"
                  type="button"
                  className={styles.btnQuickReject}
                  onClick={() => handleDecision("rejected")}
                  title="Reject this AI grading"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Reject
                </button>
                <button
                  id="btn-mock-accept"
                  type="button"
                  className={styles.btnQuickAccept}
                  onClick={() => handleDecision("approved")}
                  title="Accept this AI grading"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Approve
                </button>
              </div>
            </div>
          </div>

          {/* Grad-CAM Heatmap */}
          <div className={styles.gradcamSection}>
            <GradCAMViewer report={report} imagePreview={imagePreview} />
          </div>
        </div>

        {/* Grade Override / Confirmation Selection */}
        <div className={styles.overrideSection}>
          <div className={styles.overrideHeader}>
            <div className={styles.overrideLabel}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Doctor Grading Authority</span>
              {isOverridden && (
                <span style={{ fontSize: 11, color: "#f59e0b", background: "rgba(245,158,11,0.15)", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                  Override Active: Level {selectedGrade}
                </span>
              )}
            </div>

            <div className={styles.overrideToggleGroup}>
              <button
                type="button"
                className={`${styles.overrideToggleBtn} ${overrideMode === "confirm" ? styles.overrideToggleBtnActive : ""}`}
                onClick={() => {
                  setOverrideMode("confirm");
                  setSelectedGrade(report.drGrade);
                }}
              >
                Confirm AI Grade (Level {report.drGrade})
              </button>
              <button
                type="button"
                className={`${styles.overrideToggleBtn} ${overrideMode === "override" ? styles.overrideToggleBtnActive : ""}`}
                onClick={() => setOverrideMode("override")}
              >
                Override AI Grade
              </button>
            </div>
          </div>

          {overrideMode === "override" && (
            <div className={styles.gradePicker}>
              {GRADE_OPTIONS.map((opt) => {
                const isSelected = selectedGrade === opt.grade;
                const optConfig = DR_GRADE_CONFIG[opt.grade as keyof typeof DR_GRADE_CONFIG];
                return (
                  <div
                    key={opt.grade}
                    className={`${styles.gradePickerItem} ${isSelected ? styles.gradePickerItemActive : ""}`}
                    onClick={() => setSelectedGrade(opt.grade)}
                  >
                    <div className={styles.gradePickerLevel} style={{ color: isSelected ? optConfig.color : "inherit" }}>
                      Level {opt.grade}: {opt.label}
                    </div>
                    <div className={styles.gradePickerDesc}>{opt.desc}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Doctor notes */}
        <div className={styles.notesSection}>
          <label className={styles.notesLabel} htmlFor="doctor-notes">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Doctor&apos;s Clinical Notes &amp; Rationale
          </label>
          <textarea
            id="doctor-notes"
            className={styles.notesInput}
            rows={2}
            placeholder={
              isOverridden
                ? `Enter rationale for overriding AI Grade ${report.drGrade} to Level ${selectedGrade}...`
                : "Add clinical observations, follow-up instructions, or comments (optional)..."
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Decision buttons */}
        <div className={styles.decisionRow}>
          <div className={styles.decisionInfo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              Final clinical decision logged under doctor ID <strong>{doctor.id}</strong> in telemedicine audit trail.
            </span>
          </div>

          <div className={styles.decisionButtons}>
            <button
              id="btn-reject"
              className={`${styles.btnReject} ${hovering === "reject" ? styles.btnFlagHover : ""}`}
              onMouseEnter={() => setHovering("reject")}
              onMouseLeave={() => setHovering(null)}
              onClick={() => handleDecision("rejected")}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Reject AI Diagnosis
            </button>

            <button
              id="btn-flag-referral"
              className={`${styles.btnFlag} ${hovering === "flag" ? styles.btnFlagHover : ""}`}
              onMouseEnter={() => setHovering("flag")}
              onMouseLeave={() => setHovering(null)}
              onClick={() => handleDecision("flagged")}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Flag for Referral
            </button>

            <button
              id="btn-approve"
              className={`${styles.btnApprove} ${hovering === "approve" ? styles.btnApproveHover : ""}`}
              onMouseEnter={() => setHovering("approve")}
              onMouseLeave={() => setHovering(null)}
              onClick={() => handleDecision("approved")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {isOverridden ? `Accept (Override Level ${selectedGrade})` : "Accept AI Grading"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
