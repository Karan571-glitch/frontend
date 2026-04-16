"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import "./devices.css";
import "@/app/components/cards.css";
import "@/app/styles/responsive.css";
import AppShell from "@/app/components/appNavHead";
import { API_BASE, getAuthHeaders } from "@/lib/apiBase";

/* ─── Icon helper ─── */
function MonoIcon({ children, className = "devCardGlyph" }) {
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

/* ─── Modal wrapper ─── */
function ModalWrapper({ title, children, onClose }) {
  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h2 className="modalTitleText">{title}</h2>
          <button className="closeBtn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}

/* ─── Form field ─── */
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

/* ─── Status pill ─── */
function StatusPill({ status }) {
  const map = {
    active:      { cls: "active",      label: "Active" },
    inactive:    { cls: "inactive",    label: "Inactive" },
    maintenance: { cls: "maintenance", label: "Maintenance" },
  };
  const { cls, label } = map[status] || { cls: "inactive", label: status || "Unknown" };
  return <span className={`devPill ${cls}`}>{label}</span>;
}

/* ─── Add Device Modal ─── */
function AddDeviceModal({ onClose, onSuccess, sites }) {
  const [form, setForm] = useState({
    device_name: "", device_code: "", site_id: "",
    device_type: "", status: "active", firmware_version: "",
  });
  const [error, setError]     = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
    setFieldErrors((p) => ({ ...p, [k]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const errs = {};
    if (!form.device_name.trim()) errs.device_name = "Device name is required.";
    else if (form.device_name.trim().length < 2) errs.device_name = "Device name must be at least 2 characters.";
    if (!form.device_code.trim()) errs.device_code = "Device code is required.";
    else if (!/^[A-Za-z0-9\-_]+$/.test(form.device_code.trim())) errs.device_code = "Device code can only contain letters, numbers, hyphens and underscores.";
    if (!form.site_id) errs.site_id = "Please select a site.";
    if (form.firmware_version.trim() && !/^v?\d+\.\d+(\.\d+)?$/.test(form.firmware_version.trim()))
      errs.firmware_version = "Use format like v1.0.0 or 1.0.0.";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ ...form, site_id: Number(form.site_id) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to create device"); return; }
      onSuccess(); onClose();
    } catch { setError("Server error. Please try again."); }
    finally { setLoading(false); }
  }

  const fe = (k) => ({ border: fieldErrors[k] ? "1px solid #DC2626" : undefined });
  const ErrMsg = ({ k }) => fieldErrors[k] ? <span style={{ color: "#DC2626", fontSize: "12px" }}>{fieldErrors[k]}</span> : null;

  return (
    <ModalWrapper title="Add Device" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Device Name <span style={{ color: "#DC2626" }}>*</span></label>
          <input className="input" value={form.device_name} placeholder="e.g., Sensor Unit A"
            style={fe("device_name")} onChange={(e) => update("device_name", e.target.value)} />
          <ErrMsg k="device_name" />
        </div>
        <div className="field">
          <label className="label">Device Code <span style={{ color: "#DC2626" }}>*</span></label>
          <input className="input" value={form.device_code} placeholder="e.g., DEV-001"
            style={fe("device_code")} onChange={(e) => update("device_code", e.target.value)} />
          <ErrMsg k="device_code" />
        </div>

        <div className="twoCol">
          <div className="field">
            <label className="label">Site <span style={{ color: "#DC2626" }}>*</span></label>
            <select className="select" value={form.site_id} style={fe("site_id")}
              onChange={(e) => update("site_id", e.target.value)}>
              <option value="">Select Site</option>
              {sites.map((s) => <option key={s.site_id} value={s.site_id}>{s.site_name}</option>)}
            </select>
            <ErrMsg k="site_id" />
          </div>
          <div className="field">
            <label className="label">Device Type</label>
            <input className="input" value={form.device_type} placeholder="e.g., sensor, controller"
              onChange={(e) => update("device_type", e.target.value)} />
          </div>
        </div>

        <div className="twoCol">
          <div className="field">
            <label className="label">Status</label>
            <select className="select" value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Firmware Version</label>
            <input className="input" value={form.firmware_version} placeholder="e.g., v1.2.0"
              style={fe("firmware_version")} onChange={(e) => update("firmware_version", e.target.value)} />
            <ErrMsg k="firmware_version" />
          </div>
        </div>

        {error && <div className="formError">{error}</div>}

        <div className="modalActions">
          <button type="button" className="btnSecondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btnPrimary" disabled={loading}>
            {loading ? "Creating…" : "Create Device"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

/* ─── Edit Device Modal ─── */
function EditDeviceModal({ device, onClose, onSuccess, sites }) {
  const [form, setForm] = useState({
    device_name: device.device_name || "", device_code: device.device_code || "",
    site_id: device.site_id || "", device_type: device.device_type || "",
    status: device.status || "active", firmware_version: device.firmware_version || "",
  });
  const [error, setError]     = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
    setFieldErrors((p) => ({ ...p, [k]: "" }));
  }

  async function handleSave() {
    setError("");
    const errs = {};
    if (!form.device_name.trim()) errs.device_name = "Device name is required.";
    else if (form.device_name.trim().length < 2) errs.device_name = "Device name must be at least 2 characters.";
    if (!form.device_code.trim()) errs.device_code = "Device code is required.";
    else if (!/^[A-Za-z0-9\-_]+$/.test(form.device_code.trim())) errs.device_code = "Device code can only contain letters, numbers, hyphens and underscores.";
    if (!form.site_id) errs.site_id = "Please select a site.";
    if (form.firmware_version.trim() && !/^v?\d+\.\d+(\.\d+)?$/.test(form.firmware_version.trim()))
      errs.firmware_version = "Use format like v1.0.0 or 1.0.0.";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/devices/${device.device_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ ...form, site_id: Number(form.site_id) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Update failed"); return; }
      onSuccess(); onClose();
    } catch { setError("Server error. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    setError("");
    if (!confirm("Are you sure you want to delete this device?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/devices/${device.device_id}`, {
        method: "DELETE", headers: { ...getAuthHeaders() },
      });
      if (!res.ok) { setError("Delete failed. Please try again."); return; }
      onSuccess(); onClose();
    } catch { setError("Server error. Please try again."); }
    finally { setLoading(false); }
  }

  const fe = (k) => ({ border: fieldErrors[k] ? "1px solid #DC2626" : undefined });
  const ErrMsg = ({ k }) => fieldErrors[k] ? <span style={{ color: "#DC2626", fontSize: "12px" }}>{fieldErrors[k]}</span> : null;

  return (
    <ModalWrapper title="Edit Device" onClose={onClose}>
      <div className="field">
        <label className="label">Device Name <span style={{ color: "#DC2626" }}>*</span></label>
        <input className="input" value={form.device_name} placeholder="e.g., Sensor Unit A"
          style={fe("device_name")} onChange={(e) => update("device_name", e.target.value)} />
        <ErrMsg k="device_name" />
      </div>
      <div className="field">
        <label className="label">Device Code <span style={{ color: "#DC2626" }}>*</span></label>
        <input className="input" value={form.device_code} placeholder="e.g., DEV-001"
          style={fe("device_code")} onChange={(e) => update("device_code", e.target.value)} />
        <ErrMsg k="device_code" />
      </div>

      <div className="twoCol">
        <div className="field">
          <label className="label">Site <span style={{ color: "#DC2626" }}>*</span></label>
          <select className="select" value={form.site_id} style={fe("site_id")}
            onChange={(e) => update("site_id", e.target.value)}>
            <option value="">Select Site</option>
            {sites.map((s) => <option key={s.site_id} value={s.site_id}>{s.site_name}</option>)}
          </select>
          <ErrMsg k="site_id" />
        </div>
        <div className="field">
          <label className="label">Device Type</label>
          <input className="input" value={form.device_type} placeholder="e.g., sensor, controller"
            onChange={(e) => update("device_type", e.target.value)} />
        </div>
      </div>

      <div className="twoCol">
        <div className="field">
          <label className="label">Status</label>
          <select className="select" value={form.status} onChange={(e) => update("status", e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Firmware Version</label>
          <input className="input" value={form.firmware_version} placeholder="e.g., v1.2.0"
            style={fe("firmware_version")} onChange={(e) => update("firmware_version", e.target.value)} />
          <ErrMsg k="firmware_version" />
        </div>
      </div>

      {error && <div className="formError">{error}</div>}

      <div className="modalActions between">
        <button className="btnDanger" type="button" onClick={handleDelete} disabled={loading}>
          {loading ? "Processing…" : "Delete"}
        </button>
        <div className="rightActions">
          <button className="btnSecondary" type="button" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btnPrimary" type="button" onClick={handleSave} disabled={loading}>
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
export default function DevicesPage() {
  const [devices, setDevices]       = useState([]);
  const [sites, setSites]           = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const pathname = usePathname();

  /* Fetch sites */
  useEffect(() => {
    let cancelled = false;
    async function fetchSites() {
      try {
        const res  = await fetch(`${API_BASE}/sites`, { headers: { ...getAuthHeaders() } });
        const data = await res.json();
        if (!cancelled) setSites(Array.isArray(data) ? data : []);
      } catch { if (!cancelled) setSites([]); }
    }
    fetchSites();
    return () => { cancelled = true; };
  }, [pathname]);

  /* Fetch devices */
  useEffect(() => {
    let cancelled = false;
    async function fetchDevices() {
      setLoading(true);
      const url = selectedSite
        ? `${API_BASE}/devices?site_id=${selectedSite}`
        : `${API_BASE}/devices`;
      try {
        const res  = await fetch(url, { headers: { ...getAuthHeaders() } });
        const data = await res.json();
        if (!cancelled) { setDevices(Array.isArray(data) ? data : []); setLoading(false); }
      } catch { if (!cancelled) { setDevices([]); setLoading(false); } }
    }
    fetchDevices();
    return () => { cancelled = true; };
  }, [selectedSite, refreshKey]);

  /* Stats */
  const totalDevices       = devices.length;
  const activeDevices      = useMemo(() => devices.filter((d) => d.status === "active").length,      [devices]);
  const offlineDevices     = useMemo(() => devices.filter((d) => d.status === "inactive").length,    [devices]);
  const maintenanceDevices = useMemo(() => devices.filter((d) => d.status === "maintenance").length, [devices]);

  return (
    <AppShell active="devices">
      <div className="devicesPage responsivePage">

        {/* ───── HERO ───── */}
        <section className="devicesHero">
          <p className="devKicker">Operations Control</p>
          <div className="devHeroTop">
            <h1>Device Management</h1>
            <span className="devHeroBadge">{totalDevices} devices registered</span>
          </div>
          <p className="devHeroLead">
            Monitor, manage, and configure all devices across every operational site — track status, firmware, and assignments in real time.
          </p>
          <div className="devHeroRail" aria-hidden="true" />
        </section>

        <div className="responsiveStack">

          {/* ───── STAT CARDS ───── */}
          <section className="devCards responsiveSection" aria-label="Device statistics">
            <div className="devCard">
              <div className="devCardIcon">
                <MonoIcon>
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <path d="M8 20h8" /><path d="M12 16v4" />
                </MonoIcon>
              </div>
              <div>
                <div className="devCardValue">{totalDevices}</div>
                <div className="devCardLabel">Total Devices</div>
              </div>
            </div>

            <div className="devCard">
              <div className="devCardIcon">
                <MonoIcon><circle cx="12" cy="12" r="8" /></MonoIcon>
              </div>
              <div>
                <div className="devCardValue">{activeDevices}</div>
                <div className="devCardLabel">Active</div>
              </div>
            </div>

            <div className="devCard">
              <div className="devCardIcon">
                <MonoIcon>
                  <circle cx="12" cy="12" r="8" />
                  <path d="M8.5 8.5l7 7" />
                </MonoIcon>
              </div>
              <div>
                <div className="devCardValue">{offlineDevices}</div>
                <div className="devCardLabel">Offline</div>
              </div>
            </div>

            <div className="devCard">
              <div className="devCardIcon">
                <MonoIcon>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1 1 0 00.2 1.1l.1.1a1 1 0 010 1.4l-1.3 1.3a1 1 0 01-1.4 0l-.1-.1a1 1 0 00-1.1-.2 1 1 0 00-.6.9V20a1 1 0 01-1 1h-1.8a1 1 0 01-1-1v-.2a1 1 0 00-.6-.9 1 1 0 00-1.1.2l-.1.1a1 1 0 01-1.4 0L4.9 18a1 1 0 010-1.4l.1-.1a1 1 0 00.2-1.1 1 1 0 00-.9-.6H4a1 1 0 01-1-1V12a1 1 0 011-1h.2a1 1 0 00.9-.6 1 1 0 00-.2-1.1l-.1-.1a1 1 0 010-1.4L6.1 6a1 1 0 011.4 0l.1.1a1 1 0 001.1.2 1 1 0 00.6-.9V5a1 1 0 011-1h1.8a1 1 0 011 1v.2a1 1 0 00.6.9 1 1 0 001.1-.2l.1-.1a1 1 0 011.4 0l1.3 1.3a1 1 0 010 1.4l-.1.1a1 1 0 00-.2 1.1 1 1 0 00.9.6h.2a1 1 0 011 1v1.8a1 1 0 01-1 1h-.2a1 1 0 00-.9.6z" />
                </MonoIcon>
              </div>
              <div>
                <div className="devCardValue">{maintenanceDevices}</div>
                <div className="devCardLabel">Maintenance</div>
              </div>
            </div>
          </section>

          {/* ───── DEVICES TABLE ───── */}
          <section className="devPanel responsiveSection">
            <div className="devPanelHead">
              <h2>All Devices</h2>
              <div className="devPanelActions">
                <select
                  className="devFilterSelect"
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                >
                  <option value="">All Sites</option>
                  {sites.map((s) => (
                    <option key={s.site_id} value={s.site_id}>{s.site_name}</option>
                  ))}
                </select>
                <button className="devAddBtn" onClick={() => setShowAdd(true)}>
                  + Add Device
                </button>
              </div>
            </div>

            <div className="devTableWrap">
              <table className="devTable">
                <thead>
                  <tr>
                    <th>Device Code</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Site</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6">
                        <div className="devEmptyState">
                          <div className="devEmptyIcon">⏳</div>
                          <p>Loading devices…</p>
                        </div>
                      </td>
                    </tr>
                  ) : devices.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div className="devEmptyState">
                          <div className="devEmptyIcon">🖥️</div>
                          <p>No devices found. Add one to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    devices.map((d) => (
                      <tr key={d.device_id}>
                        <td data-label="Device Code">
                          <span className="devCodeTag">{d.device_code}</span>
                        </td>
                        <td data-label="Name">
                          <span className="devNameCell">{d.device_name}</span>
                        </td>
                        <td data-label="Type">{d.device_type || "—"}</td>
                        <td data-label="Status"><StatusPill status={d.status} /></td>
                        <td data-label="Site">{d.site_name || "—"}</td>
                        <td data-label="Actions">
                          <button className="devEditBtn" onClick={() => setEditDevice(d)}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="devFooter responsiveFooter">
            © {new Date().getFullYear()} Blue Giant Equipment Corporation
          </footer>

        </div>
      </div>

      {showAdd && (
        <AddDeviceModal
          sites={sites}
          onClose={() => setShowAdd(false)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {editDevice && (
        <EditDeviceModal
          device={editDevice}
          sites={sites}
          onClose={() => setEditDevice(null)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </AppShell>
  );
}
