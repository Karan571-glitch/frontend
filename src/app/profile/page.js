"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./profile.css";
import AppNavHead from "@/app/components/appNavHead";
import { API_BASE } from "@/lib/apiBase";

function ProfileGlyph({ className = "profileGlyph" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" />
    </svg>
  );
}

function CameraGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="cameraGlyph" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h4l1.4-2h5.2L16 8h4v11H4z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function MenuGlyph({ type }) {
  const icons = {
    image: (<><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.2" /><path d="M21 15l-4.5-4.5L7 20" /></>),
    save:  (<><path d="M5 4h11l3 3v13H5z" /><path d="M9 4v5h6" /><path d="M9 20v-5h6v5" /></>),
  };
  return (
    <svg viewBox="0 0 24 24" className="menuGlyph" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[type]}
    </svg>
  );
}

function getImageUrl(key) {
  if (!key) return null;
  if (key.startsWith("blob:")) return key;
  return `${API_BASE}/users/profile-picture/${encodeURIComponent(key)}`;
}

export default function ProfilePage() {
  const router      = useRouter();
  const fileInputRef = useRef(null);
  const menuRef      = useRef(null);

  const [user, setUser]               = useState({ name: "", email: "", role_id: "", profile_picture: null });
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showMenu, setShowMenu]         = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [uploadMsg, setUploadMsg]       = useState("");
  const [uploadError, setUploadError]   = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => { if (!res.ok) { router.push("/login"); return null; } return res.json(); })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          if (data.user.profile_picture) setProfileImage(data.user.profile_picture);
        }
      })
      .catch((err) => console.error(err));
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleName = (roleId) =>
    roleId === 1 || roleId === "1" ? "Admin" : roleId === 2 || roleId === "2" ? "Technician" : "Unknown";

  const initials = useMemo(() => {
    if (!user.name) return "BG";
    return user.name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  }, [user.name]);

  const displayName  = user.name?.trim()  || "Blue Giant User";
  const displayEmail = user.email?.trim() || "—";
  const displayRole  = user.role_id ? getRoleName(user.role_id) : "Account Profile";

  const handleChangePicture = () => { fileInputRef.current?.click(); setShowMenu(false); };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select a valid image file."); return; }
    setSelectedFile(file);
    setUploadMsg(""); setUploadError("");
    setProfileImage(URL.createObjectURL(file));
  };

  const handleSavePicture = async () => {
    if (!selectedFile) { setUploadError("Please select a picture first."); return; }
    setUploading(true); setUploadMsg(""); setUploadError(""); setShowMenu(false);
    try {
      const token    = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profile_picture", selectedFile);
      const res  = await fetch(`${API_BASE}/users/profile-picture`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.message || "Failed to upload picture."); return; }
      setProfileImage(data.profile_picture);
      setSelectedFile(null);
      setUploadMsg("Profile picture saved successfully!");
      setUser((prev) => ({ ...prev, profile_picture: data.profile_picture }));
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Network error. Please try again.");
    } finally { setUploading(false); }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <AppNavHead active="profile">
      <div className="responsivePage">

        {/* ───── HERO ───── */}
        <section className="profileHero">
          <p className="profKicker">Blue Giant Technician Profile</p>
          <div className="profHeroTop">
            <h1>Profile Settings</h1>
            <span className="profHeroBadge">{displayRole}</span>
          </div>
          <p className="profHeroLead">
            Keep your operator details clear and current for field service, support access, and site-level operations.
          </p>
          <div className="profHeroRail" aria-hidden="true" />
        </section>

        {/* ───── ALERTS ───── */}
        {uploadMsg   && <div className="profAlert success">✓ {uploadMsg}</div>}
        {uploadError && <div className="profAlert error">{uploadError}</div>}

        {/* ───── PROFILE CARD ───── */}
        <section className="profileCard">

          {/* ── LEFT: avatar + identity ── */}
          <div className="leftProfile">
            <div className="profileSidePanel">

              <div className="avatarWrapper" ref={menuRef}>
                <div className="avatarBig">
                  {profileImage ? (
                    <img
                      src={getImageUrl(profileImage)}
                      alt="Profile"
                      className="avatarPreview"
                      onError={() => setProfileImage(null)}
                    />
                  ) : (
                    <div className="avatarInner avatarFallback">
                      <span className="avatarInitials">{initials}</span>
                      <ProfileGlyph className="avatarGlyph" />
                    </div>
                  )}
                  <button type="button" className="cameraIcon" onClick={() => setShowMenu((p) => !p)}>
                    <CameraGlyph />
                  </button>
                </div>

                {showMenu && (
                  <div className="profileMenu">
                    <div className="profileMenuHeader">
                      <span className="profileMenuEyebrow">Photo actions</span>
                      <strong>Profile image</strong>
                    </div>
                    <button type="button" onClick={handleChangePicture}>
                      <span className="menuActionIcon"><MenuGlyph type="image" /></span>
                      <span className="menuActionText">
                        <strong>Change picture</strong>
                        <small>Select a new operator image</small>
                      </span>
                    </button>
                    <button type="button" onClick={handleSavePicture} disabled={uploading}>
                      <span className="menuActionIcon save"><MenuGlyph type="save" /></span>
                      <span className="menuActionText">
                        <strong>{uploading ? "Saving…" : "Save picture"}</strong>
                        <small>Upload to your account</small>
                      </span>
                    </button>
                  </div>
                )}

                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} style={{ display: "none" }} />
              </div>

              {selectedFile && !uploading && (
                <p className="profPendingHint">Click the camera icon → Save picture to upload</p>
              )}

              <div className="profileIdentity">
                <h2>{displayName}</h2>
                <p>{displayEmail}</p>
                <span className={`rolePill ${user.role_id ? "" : "muted"}`.trim()}>
                  {displayRole}
                </span>
              </div>

              <div className="profileMetaCard">
                <span className="metaLabel">Access level</span>
                <strong>{displayRole}</strong>
                <p>Assigned for Blue Giant field operations and equipment support workflows.</p>
              </div>

            </div>

            <button className="btnPrimary" onClick={handleLogout}>Logout</button>
          </div>

          {/* ── RIGHT: form fields ── */}
          <div className="rightProfile">
            <div className="sectionHead">
              <div>
                <p className="sectionKicker">Account Details</p>
                <h2 className="sectionTitle">Operator Information</h2>
              </div>
              <span className="syncPill">Blue Giant Secure Record</span>
            </div>

            <label className="field">
              <span>Full Name</span>
              <input
                value={user.name}
                onChange={(e) => setUser((prev) => ({ ...prev, name: e.target.value }))}
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input value={user.email} readOnly />
            </label>

            <label className="field">
              <span>Role</span>
              <input value={getRoleName(user.role_id)} readOnly />
            </label>

            <div className="profileHint">
              This page is designed for quick account review. For company-wide preferences or operational settings, use the main Settings area.
            </div>
          </div>

        </section>

        <footer className="profFooter">
          © {new Date().getFullYear()} Blue Giant Equipment Corporation
        </footer>

      </div>
    </AppNavHead>
  );
}
