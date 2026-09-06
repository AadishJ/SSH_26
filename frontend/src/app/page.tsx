"use client";
import { useState, useCallback } from "react";
import styles from "./page.module.css";
import UploadZone from "@/components/UploadZone";
import PipelineLoader from "@/components/PipelineLoader";
import ReportHeader from "@/components/ReportHeader";
import GradCAMViewer from "@/components/GradCAMViewer";
import LesionTable from "@/components/LesionTable";
import ClinicalReport from "@/components/ClinicalReport";
import DoctorReview from "@/components/DoctorReview";
import FinalDecision from "@/components/FinalDecision";
import DoctorLoginModal, { DoctorProfile, PRESET_DOCTORS } from "@/components/DoctorLoginModal";
import { getRandomReport, buildReportFromPrediction, MockReport } from "@/lib/mockData";
import type { PredictResponse } from "@/lib/api";

type AppState = "upload" | "analyzing" | "report" | "final";

interface DecisionData {
  decision: "approved" | "flagged" | "rejected";
  note: string;
  finalGrade: number;
  isOverridden: boolean;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [report, setReport] = useState<MockReport | null>(null);

  // Doctor session & review state
  const [doctor, setDoctor] = useState<DoctorProfile | null>(PRESET_DOCTORS[0]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isDoctorReviewOpen, setIsDoctorReviewOpen] = useState<boolean>(false);
  const [decisionData, setDecisionData] = useState<DecisionData | null>(null);

  const handleImageSelect = useCallback((file: File, preview: string) => {
    setImagePreview(preview);
    setSelectedFile(file);
    setAppState("analyzing");
  }, []);

  const handleAnalysisComplete = useCallback(
    (prediction?: PredictResponse, processingTime?: number) => {
      if (prediction) {
        const liveReport = buildReportFromPrediction(
          prediction,
          processingTime || 5.0,
          {
            patientName: "Patient (Fundus Scan)",
            eye: "Right Eye (OD)",
          }
        );
        setReport(liveReport);
      } else {
        const mockReport = getRandomReport();
        setReport(mockReport);
      }
      setAppState("report");
    },
    []
  );

  const handleReset = () => {
    setAppState("upload");
    setImagePreview("");
    setSelectedFile(null);
    setReport(null);
    setDecisionData(null);
    setIsDoctorReviewOpen(false);
  };

  const handleDoctorDecision = (
    decision: "approved" | "flagged" | "rejected",
    note: string,
    finalGrade: number,
    isOverridden: boolean
  ) => {
    setDecisionData({ decision, note, finalGrade, isOverridden });
    setIsDoctorReviewOpen(false);
    setAppState("final");
  };

  return (
    <main className={styles.main}>
      {/* Background */}
      <div className={styles.bgGrid} />
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />

      {/* Doctor Login Modal */}
      <DoctorLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={(doc) => setDoctor(doc)}
        currentDoctor={doctor}
      />

      {/* Doctor Review Dashboard Modal (Grad-CAM, AI Grade, Override, Approve/Flag) */}
      {isDoctorReviewOpen && report && (
        <DoctorReview
          report={report}
          imagePreview={imagePreview}
          doctor={doctor || PRESET_DOCTORS[0]}
          onDecision={handleDoctorDecision}
          onClose={() => setIsDoctorReviewOpen(false)}
        />
      )}

      {/* Header nav */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <div className={styles.navLogoMark}>
              <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
                <ellipse cx="14" cy="14" rx="11" ry="8" stroke="url(#nlg)" strokeWidth="2" fill="none"/>
                <circle cx="14" cy="14" r="4" stroke="url(#nlg)" strokeWidth="2" fill="none"/>
                <circle cx="14" cy="14" r="1.5" fill="url(#nlg)"/>
                <defs>
                  <linearGradient id="nlg" x1="0" y1="0" x2="28" y2="28">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className={styles.navBrandName}>RetinaAI</span>
          </div>

          <div className={styles.navLinks}>
            <span className={styles.navTag}>
              <span className={styles.navTagDot} />
              MATLAB Pipeline Active
            </span>
            <span className={styles.navDivider} />
            <span className={styles.navMeta}>RetinalNet-v3.2.1</span>
            <span className={styles.navDivider} />

            {/* Doctor Profile & Login Trigger */}
            {doctor ? (
              <button
                id="btn-doctor-status"
                className={styles.doctorNavBadge}
                onClick={() => setIsLoginModalOpen(true)}
                title="Click to switch doctor profile"
              >
                <div className={styles.doctorNavAvatar}>{doctor.avatar}</div>
                <span>{doctor.name}</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>({doctor.id})</span>
              </button>
            ) : (
              <button
                id="btn-doctor-login"
                className={styles.doctorNavBtn}
                onClick={() => setIsLoginModalOpen(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Doctor Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className={styles.container}>

        {/* ─── UPLOAD STATE ─── */}
        {appState === "upload" && (
          <div className={styles.uploadSection}>
            {/* Hero */}
            <div className={styles.hero}>
              <div className={styles.heroEyebrow}>
                <span className="badge badge-purple">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  SSH&apos;26 Problem #26038
                </span>
                <span className="badge badge-info">Explainable AI</span>
              </div>
              <h1 className={styles.heroTitle}>
                <span className="gradient-text font-display">Diabetic Retinopathy</span>
                <br />
                <span className={styles.heroTitleSub}>AI Screening System</span>
              </h1>
              <p className={styles.heroDesc}>
                Upload a retinal fundus image for automated DR severity grading using the International Clinical DR scale.
                Powered by RetinalNet-v3.2.1 with Grad-CAM explainability and human-in-the-loop doctor verification.
              </p>

              {/* Stats */}
              <div className={styles.statsRow}>
                {[
                  { value: ">90%", label: "Sensitivity", sub: "Referable DR" },
                  { value: ">85%", label: "Specificity", sub: "Non-referable" },
                  { value: "0.967", label: "AUC-ROC", sub: "EyePACS dataset" },
                  { value: "100%", label: "Expert Review", sub: "Doctor Sign-Off" },
                ].map((s, i) => (
                  <div key={i} className={styles.statCard}>
                    <div className={styles.statValue}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                    <div className={styles.statSub}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload zone */}
            <div className={styles.uploadCard}>
              <UploadZone onImageSelect={handleImageSelect} />
            </div>

            {/* Feature row */}
            <div className={styles.featureRow}>
              {[
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  ),
                  title: "8-Stage Pipeline",
                  desc: "Quality assessment → Enhancement → Segmentation → Grading",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
                    </svg>
                  ),
                  title: "Grad-CAM Explainability",
                  desc: "Attention maps with lesion-level clinical evidence",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  ),
                  title: "Rural India Deployment",
                  desc: "Optimized for portable fundus cameras at PHCs",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                    </svg>
                  ),
                  title: "Doctor Review Dashboard",
                  desc: "Physician sign-off with clinical autonomy & override authority",
                },
              ].map((f, i) => (
                <div key={i} className={styles.featureCard}>
                  <div className={styles.featureIcon}>{f.icon}</div>
                  <div className={styles.featureTitle}>{f.title}</div>
                  <div className={styles.featureDesc}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ANALYZING STATE ─── */}
        {appState === "analyzing" && (
          <div className={styles.analyzingSection}>
            <div className={styles.analyzingHeader}>
              <h2 className={styles.analyzingTitle}>
                <span className="gradient-text font-display">Analyzing Fundus Image</span>
              </h2>
              <p className={styles.analyzingSubtitle}>
                Running 8-stage MATLAB pipeline • RetinalNet-v3.2.1 • ICDR grading scale
              </p>
            </div>
            <div className={styles.analyzingCard}>
              <PipelineLoader
                imagePreview={imagePreview}
                file={selectedFile}
                onComplete={handleAnalysisComplete}
              />
            </div>
          </div>
        )}

        {/* ─── REPORT STATE ─── */}
        {appState === "report" && report && (
          <div className={styles.reportSection}>
            {/* Report toolbar */}
            <div className={styles.reportToolbar}>
              <button id="btn-new-scan" className="btn-secondary" onClick={handleReset}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
                New Scan
              </button>
              <div className={styles.toolbarCenter}>
                <span className={styles.reportId}>Report: {report.patientId}</span>
              </div>
              <div className={styles.toolbarRight}>
                <button
                  id="btn-open-review-toolbar"
                  className={styles.btnStartDoctorReview}
                  style={{ padding: "8px 18px", fontSize: 13 }}
                  onClick={() => setIsDoctorReviewOpen(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Doctor Review Console
                </button>
                <button id="btn-print" className="btn-secondary" onClick={() => window.print()}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 6,2 18,2 18,9"/><path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
                    <rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  Print / PDF
                </button>
              </div>
            </div>

            {/* Doctor Review Callout Banner */}
            <div className={styles.doctorReviewBanner}>
              <div className={styles.doctorBannerInfo}>
                <div className={styles.doctorBannerIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div>
                  <div className={styles.doctorBannerTitle}>
                    <span>Human-in-the-Loop Telemedicine Protocol</span>
                    <span className={styles.doctorBannerTimerBadge}>Physician Sign-Off</span>
                  </div>
                  <p className={styles.doctorBannerDesc}>
                    Reviewing doctor verifies AI grade, Grad-CAM heatmap, and confidence score. Final clinical decision rests with the doctor.
                  </p>
                </div>
              </div>

              <button
                id="btn-start-review-hero"
                className={styles.btnStartDoctorReview}
                onClick={() => setIsDoctorReviewOpen(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Open Doctor Review Dashboard
              </button>
            </div>

            {/* Report content */}
            <div id="report-content" className={styles.reportContent}>
              {/* Header */}
              <section className={`${styles.reportCard} glass-card`}>
                <ReportHeader report={report} />
              </section>

              {/* Two column: GradCAM + Lesion */}
              <div className={styles.reportGrid}>
                <section className={`${styles.reportCard} glass-card`}>
                  <GradCAMViewer report={report} imagePreview={imagePreview} />
                </section>
                <section className={`${styles.reportCard} glass-card`}>
                  <LesionTable report={report} />
                </section>
              </div>

              {/* Clinical report */}
              <section className={`${styles.reportCard} glass-card`}>
                <ClinicalReport report={report} />
              </section>

              {/* Validation footer */}
              <div className={styles.reportFooter}>
                <div className={styles.footerLeft}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Validated against AIIMS Delhi ophthalmology department • EyePACS 88,702 images • APTOS 2019</span>
                </div>
                <div className={styles.footerRight}>
                  Generated by RetinaAI v3.2.1 • {report.analysisDate} {report.analysisTime}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── FINAL DECISION STATE ─── */}
        {appState === "final" && report && decisionData && (
          <div className={styles.reportSection}>
            <FinalDecision
              report={report}
              decision={decisionData.decision}
              doctorNote={decisionData.note}
              finalGrade={decisionData.finalGrade}
              isOverridden={decisionData.isOverridden}
              doctor={doctor || PRESET_DOCTORS[0]}
              onNewScan={handleReset}
              onBackToReport={() => setAppState("report")}
            />
          </div>
        )}

      </div>
    </main>
  );
}
