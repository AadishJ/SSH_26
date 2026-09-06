"use client";
import { useState } from "react";
import styles from "./DoctorLoginModal.module.css";

export interface DoctorProfile {
  id: string;
  name: string;
  designation: string;
  hospital: string;
  avatar: string;
}

export const PRESET_DOCTORS: DoctorProfile[] = [
  {
    id: "AIIMS-OPH-0042",
    name: "Dr. Priya Nair",
    designation: "Senior Ophthalmologist",
    hospital: "AIIMS Telemedicine Hub",
    avatar: "PN",
  },
  {
    id: "MCI-RET-8921",
    name: "Dr. Rajesh Sharma",
    designation: "Vitreo-Retina Specialist",
    hospital: "District Hospital Chhatarpur",
    avatar: "RS",
  },
  {
    id: "PHC-MED-3310",
    name: "Dr. Ananya Verma",
    designation: "Primary Health Officer",
    hospital: "Tikamgarh Rural PHC",
    avatar: "AV",
  },
];

interface DoctorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (doctor: DoctorProfile) => void;
  currentDoctor: DoctorProfile | null;
}

export default function DoctorLoginModal({
  isOpen,
  onClose,
  onLogin,
  currentDoctor,
}: DoctorLoginModalProps) {
  const [selectedDoc, setSelectedDoc] = useState<DoctorProfile>(
    currentDoctor || PRESET_DOCTORS[0]
  );
  const [pin, setPin] = useState("••••");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedDoc);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerGlow} />
          <div className={styles.titleArea}>
            <div className={styles.iconWrap}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h3 className={styles.title}>Doctor Authentication</h3>
              <p className={styles.subtitle}>Telemedicine Tele-Ophthalmology Portal</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <div>
              <div className={styles.sectionLabel}>Select Active Clinician</div>
              <div className={styles.doctorList}>
                {PRESET_DOCTORS.map((doc) => {
                  const isActive = selectedDoc.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      className={`${styles.doctorCard} ${isActive ? styles.doctorCardActive : ""}`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className={styles.avatar}>{doc.avatar}</div>
                      <div className={styles.docInfo}>
                        <div className={styles.docName}>{doc.name}</div>
                        <div className={styles.docRole}>{doc.designation} • {doc.hospital}</div>
                        <div className={styles.docId}>{doc.id}</div>
                      </div>
                      {isActive && <div className={styles.checkMark}>✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Digital Signature PIN / Passcode</label>
              <input
                type="password"
                className={styles.input}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
              />
            </div>

            <div className={styles.badgeAutonomy}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>
                <strong>Clinical Authority Notice:</strong> In accordance with telemedicine guidelines, AI findings are advisory only. Final diagnostic and referral authority remains exclusively with the authenticated doctor.
              </span>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="btn-confirm-doctor-login" className={styles.btnSubmit}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Authenticate &amp; Start Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
