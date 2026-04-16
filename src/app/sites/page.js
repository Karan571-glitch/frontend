"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import "./sites.css";
import "@/app/components/cards.css";
import "@/app/styles/responsive.css";
import AppShell from "@/app/components/appNavHead";
import { API_BASE, getAuthHeaders } from "@/lib/apiBase";

function MonoIcon({ children, className = "siteGlyph" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function ModalWrapper({ title, children, onClose }) {
  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div className="modalCard responsiveModalCard" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <p className="modalKicker">Blue Giant</p>
            <h2 className="modalTitleText">{title}</h2>
          </div>
          <button className="closeBtn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}

function AddSiteModal({ onClose, onSuccess }) {
  const [form, setForm]       = useState({ site_name: "", site_code: "", location: "", is_active: true });
  const [error, setError]     = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((p) => ({ ...p, [key]: "" }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const errs = {};
    if (!form.site_name.trim()) errs.site_name = "Site name is required.";
    else if (form.site_name.trim().length < 2) errs.site_name = "Site name must be at least 2 characters.";
    if (!form.location.trim()) errs.location = "Location is required.";
    if (form.site_code.trim() && !/^[A-Za-z0-9\-_]+$/.test(form.site_code.trim())) errs.site_code = "Site code can only contain letters, numbers, hyphens and underscores.";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    try {
      setLoading(true);
      const res  = await fetch(`${API_BASE}/sites`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to create site"); return; }
      onSuccess(); onClose();
    } catch { setError("Server error"); }
    finally { setLoading(false); }
  }

  return (
    <ModalWrapper title="Add New Site" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Site Name <span style={{ color: "#DC2626" }}>*</span></label>
          <input className="input" value={form.site_name} placeholder="e.g., Loading Dock Sensors"
            onChange={(e) => updateField("site_name", e.target.value)}
            style={{ border: fieldErrors.site_name ? "1px solid #DC2626" : undefined }} />
          {fieldErrors.site_name && <span style={{ color: "#DC2626", fontSize: "12px" }}>{fieldErrors.site_name}</span>}
        </div>
        <div className="field">
          <label className="label">Site Code</label>
          <input className="input" value={form.site_code} placeholder="e.g., SITE-001"
            onChange={(e) => updateField("site_code", e.target.value)}
            style={{ border: fieldErrors.site_code ? "1px solid #DC2626" : undefined }} />
          {fieldErrors.site_code && <span style={{ color: "#DC2626", fontSize: "12px" }}>{fieldErrors.site_code}</span>}
        </div>
        <div className="field">
          <label className="label">Location <span style={{ color: "#DC2626" }}>*</span></label>
          <input className="input" value={form.location} placeholder="e.g., Section A - Loading Dock"
            onChange={(e) => updateField("location", e.target.value)}
            style={{ border: fieldErrors.location ? "1px solid #DC2626" : undefined }} />
          {fieldErrors.location && <span style={{ color: "#DC2626", fontSize: "12px" }}>{fieldErrors.location}</span>}
        </div>
        {error && <div className="formError">{error}</div>}
        <div className="modalActions">
          <button type="button" className="btnSecondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btnPrimary" disabled={loading}>
            {loading ? "Creating…" : "Create Site"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

function EditSiteModal({ site, onClose, onSuccess }) {
  const [form, setForm]       = useState({
    site_name: site.site_name || "", site_code: site.site_code || "",
    location: site.location || "", is_active: !!site.is_active,
  });
  const [error, setError]     = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((p) => ({ ...p, [key]: "" }));
  };

  async function handleSave() {
    setError("");
    const errs = {};
    if (!form.site_name.trim()) errs.site_name = "Site name is required.";
    if (!form.site_code.trim()) errs.site_code = "Site code is required.";
    else if (!/^[A-Za-z0-9\-_]+$/.test(form.site_code.trim())) errs.site_code = "Site code can only contain letters, numbers, hyphens and underscores.";
    if (!form.location.trim()) errs.location = "Location is required.";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    try {
      setLoading(true);
      const res  = await fetch(`${API_BASE}/sites/${site.site_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Update failed"); return; }
      onSuccess(); onClose();
    } catch { setError("Server error"); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!confirm("Delete this site?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/sites/${site.site_id}`, {
        method: "DELETE", headers: { ...getAuthHeaders() },
      });
      if (!res.ok) { setError("Delete failed"); return; }
      onSuccess(); onClose();
    } catch { setError("Server error"); }
    finally { setLoading(false); }
  }

  return (
    <ModalWrapper title="Edit Site" onClose={onClose}>
      <div className="field">
        <label className="label">Site Name <span style={{ color: "#DC2626" }}>*</span></label>
        <input className="input" value={form.site_name} onChange={(e) => updateField("site_name", e.target.value)}
          style={{ border: fieldErrors.site_name ? "1px solid #DC2626" : undefined }} />
        {fieldErrors.site_name && <span style={{ color: "#DC2626", fontSize: "12px" }}>{fieldErrors.site_name}</span>}
      </div>
      <div className="field">
        <label className="label">Site Code <span style={{ color: "#DC2626" }}>*</span></label>
        <input className="input" value={form.site_code} onChange={(e) => updateField("site_code", e.target.value)}
          style={{ border: fieldErrors.site_code ? "1px solid #DC2626" : undefined }} />
        {fieldErrors.site_code && <span style={{ color: "#DC2626", fontSize: "12px" }}>{fieldErrors.site_code}</span>}
      </div>
      <div className="field">
        <label className="label">Location <span style={{ color: "#DC2626" }}>*</span></label>
        <input className="input" value={form.location} onChange={(e) => updateField("location", e.target.value)}
          style={{ border: fieldErrors.location ? "1px solid #DC2626" : undefined }} />
        {fieldErrors.location && <span style={{ color: "#DC2626", fontSize: "12px" }}>{fieldErrors.location}</span>}
      </div>
      {error && <div className="formError">{error}</div>}
      <div className="modalActions between">
        <button className="btnDanger" type="button" onClick={handleDelete} disabled={loading}>
          {loading ? "Processing…" : "Delete"}
        </button>
        <div className="rightActions">
          <button className="btnSecondary" type="button" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btnPrimary"   type="button" onClick={handleSave} disabled={loading}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function SitesPage() {
  const [sites, setSites]       = useState([]);
  const [devices, setDevices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [editSite, setEditSite] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const pathname = usePathname();

  const getDeviceCount = (siteId) =>
    devices.filter((d) => Number(d.site_id) === Number(siteId)).length;

  useEffect(() => {
    let cancelled = false;
    async function loadPageData() {
      setLoading(true);
      try {
        const [sitesRes, devicesRes] = await Promise.all([
          fetch(`${API_BASE}/sites`,   { headers: { ...getAuthHeaders() } }),
          fetch(`${API_BASE}/devices`, { headers: { ...getAuthHeaders() } }),
        ]);
        const [sitesData, devicesData] = await Promise.all([sitesRes.json(), devicesRes.json()]);
        if (!cancelled) {
          setSites(Array.isArray(sitesData)   ? sitesData   : []);
          setDevices(Array.isArray(devicesData) ? devicesData : []);
        }
      } catch {
        if (!cancelled) { setSites([]); setDevices([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPageData();
    return () => { cancelled = true; };
  }, [pathname, refreshKey]);

  const totalSites      = sites.length;
  const activeSites     = useMemo(() => sites.filter((s) => !!s.is_active).length, [sites]);
  const totalDevices    = devices.length;
  const sitesWithDevices = useMemo(
    () => sites.filter((site) => devices.some((d) => Number(d.site_id) === Number(site.site_id))).length,
    [sites, devices]
  );

  return (
    <AppShell active="sites">
      <div className="sitesPage responsivePage">

        {/* ───── HERO (no button here) ───── */}
        <section className="sitesHero">
          <p className="sitesKicker">Infrastructure Control</p>
          <div className="sitesHeroTop">
            <div>
              <h1 className="sitesHeroTitle">Site Management</h1>
              <p className="sitesHeroText">
                Manage deployment locations, monitor operational coverage, and keep every connected device mapped to the right site.
              </p>
            </div>
          </div>
          <div className="sitesHeroRail" />
        </section>

        <div className="s-stack responsiveStack">

          {/* ───── STAT CARDS ───── */}
          <section className="siteCards responsiveSection" aria-label="Site statistics">

            <div className="siteCard">
              <div className="siteCardIcon">
                <MonoIcon>
                  <path d="M12 21s6-4.7 6-10a6 6 0 10-12 0c0 5.3 6 10 6 10z" />
                  <circle cx="12" cy="11" r="2.2" />
                </MonoIcon>
              </div>
              <div>
                <div className="siteCardValue">{totalSites}</div>
                <div className="siteCardLabel">Total Sites</div>
              </div>
            </div>

            <div className="siteCard">
              <div className="siteCardIcon">
                <MonoIcon><circle cx="12" cy="12" r="8" /></MonoIcon>
              </div>
              <div>
                <div className="siteCardValue">{activeSites}</div>
                <div className="siteCardLabel">Active Sites</div>
              </div>
            </div>

            <div className="siteCard">
              <div className="siteCardIcon">
                <MonoIcon>
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <path d="M8 20h8" /><path d="M12 16v4" />
                </MonoIcon>
              </div>
              <div>
                <div className="siteCardValue">{totalDevices}</div>
                <div className="siteCardLabel">Total Devices</div>
              </div>
            </div>

            <div className="siteCard">
              <div className="siteCardIcon">
                <MonoIcon>
                  <path d="M3 21h18" />
                  <path d="M5 21V9l6 3V9l8-4v16" />
                </MonoIcon>
              </div>
              <div>
                <div className="siteCardValue">{sitesWithDevices}</div>
                <div className="siteCardLabel">Sites With Devices</div>
              </div>
            </div>

          </section>

          {/* ───── TABLE PANEL ───── */}
          <section className="sitePanel responsiveSection">

            {/* Button lives HERE, right side of panel header */}
            <div className="sitePanelHead">
              <h2>Operational Sites</h2>
              <button className="addSiteBtn" onClick={() => setShowAdd(true)}>
                + Add Site
              </button>
            </div>

            <div className="siteTableWrap">
              <table className="siteTable">
                <thead>
                  <tr>
                    <th>Site Code</th>
                    <th>Site Name</th>
                    <th>Location</th>
                    <th>Technician</th>
                    <th>Devices</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6">
                        <div className="siteEmptyState">
                          <div className="siteEmptyIcon">⏳</div>
                          <p>Loading sites…</p>
                        </div>
                      </td>
                    </tr>
                  ) : sites.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div className="siteEmptyState">
                          <div className="siteEmptyIcon">📍</div>
                          <p>No sites found. Add one to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sites.map((s) => (
                      <tr key={s.site_id}>
                        <td data-label="Site Code">
                          <span className="siteCodeTag">{s.site_code || "—"}</span>
                        </td>
                        <td data-label="Site Name">
                          <span className="siteNameCell">{s.site_name}</span>
                        </td>
                        <td data-label="Location">{s.location || "—"}</td>
                        <td data-label="Technician">{s.technician_name || "—"}</td>
                        <td data-label="Devices">
                          <span className="siteDevCount">{getDeviceCount(s.site_id)}</span>
                        </td>
                        <td data-label="Actions">
                          <button className="siteEditBtn" onClick={() => setEditSite(s)}>Edit</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="siteFooter responsiveFooter">
            © {new Date().getFullYear()} Blue Giant Equipment Corporation
          </footer>

        </div>

        {showAdd && (
          <AddSiteModal
            onClose={() => setShowAdd(false)}
            onSuccess={() => setRefreshKey((k) => k + 1)}
          />
        )}

        {editSite && (
          <EditSiteModal
            site={editSite}
            onClose={() => setEditSite(null)}
            onSuccess={() => setRefreshKey((k) => k + 1)}
          />
        )}

      </div>
    </AppShell>
  );
}
