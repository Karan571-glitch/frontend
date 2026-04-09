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
      <div
        className="modalCard responsiveModalCard"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <h2 className="modalTitleText">{title}</h2>
          <button className="closeBtn" onClick={onClose} aria-label="Close">
            ✕
          </button>
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
  const [form, setForm] = useState({
    site_name: "",
    site_code: "",
    location: "",
    is_active: true,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.site_name.trim() || !form.location.trim()) {
      setError("Site name and location are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/sites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create site");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalWrapper title="Add Site" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field
          label="Site Name"
          value={form.site_name}
          placeholder="e.g., Loading Dock Sensors"
          onChange={(e) => updateField("site_name", e.target.value)}
        />

        <Field
          label="Site Code"
          value={form.site_code}
          placeholder="e.g., SITE-001"
          onChange={(e) => updateField("site_code", e.target.value)}
        />

        <Field
          label="Location"
          value={form.location}
          placeholder="e.g., Section A - Loading Dock"
          onChange={(e) => updateField("location", e.target.value)}
        />

        {error && <div className="formError">{error}</div>}

        <div className="modalActions">
          <button
            type="button"
            className="btnSecondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btnPrimary" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

function EditSiteModal({ site, onClose, onSuccess }) {
  const [form, setForm] = useState({
    site_name: site.site_name || "",
    site_code: site.site_code || "",
    location: site.location || "",
    is_active: !!site.is_active,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setError("");

    if (
      !form.site_name.trim() ||
      !form.location.trim() ||
      !form.site_code.trim()
    ) {
      setError("Site name, code and location are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/sites/${site.site_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Update failed");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setError("");
    if (!confirm("Delete this site?")) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/sites/${site.site_id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });

      if (!res.ok) {
        setError("Delete failed");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalWrapper title="Edit Site" onClose={onClose}>
      <Field
        label="Site Name"
        value={form.site_name}
        onChange={(e) => updateField("site_name", e.target.value)}
      />
      <Field
        label="Site Code"
        value={form.site_code}
        onChange={(e) => updateField("site_code", e.target.value)}
      />
      <Field
        label="Location"
        value={form.location}
        placeholder="e.g., Section A - Loading Dock"
        onChange={(e) => updateField("location", e.target.value)}
      />

      {error && <div className="formError">{error}</div>}

      <div className="modalActions between">
        <button
          className="btnDanger"
          type="button"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Processing..." : "Delete"}
        </button>

        <div className="rightActions">
          <button
            className="btnSecondary"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btnPrimary"
            type="button"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

export default function SitesPage() {
  const [sites, setSites] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editSite, setEditSite] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const pathname = usePathname();

  function getDeviceCount(siteId) {
    return devices.filter((d) => Number(d.site_id) === Number(siteId)).length;
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    let cancelled = false;

    async function loadPageData() {
      setLoading(true);

      try {
        const [sitesRes, devicesRes] = await Promise.all([
          fetch(`${API_BASE}/sites`, {
            headers: { ...getAuthHeaders() },
          }),
          fetch(`${API_BASE}/devices`, {
            headers: { ...getAuthHeaders() },
          }),
        ]);

        const [sitesData, devicesData] = await Promise.all([
          sitesRes.json(),
          devicesRes.json(),
        ]);

        if (!cancelled) {
          setSites(Array.isArray(sitesData) ? sitesData : []);
          setDevices(Array.isArray(devicesData) ? devicesData : []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setSites([]);
          setDevices([]);
          setLoading(false);
        }
      }
    }

    loadPageData();

    return () => {
      cancelled = true;
    };
  }, [pathname, refreshKey]);

  const totalSites = sites.length;

  const activeSites = useMemo(
    () => sites.filter((s) => !!s.is_active).length,
    [sites]
  );

  const totalDevices = devices.length;

  const sitesWithDevices = useMemo(() => {
    return sites.filter((site) =>
      devices.some((device) => Number(device.site_id) === Number(site.site_id))
    ).length;
  }, [sites, devices]);

  return (
    <AppShell active="sites">
      <div className="sitesPage responsivePage">
        <div className="sitesHeader responsiveHeader">
          <div>
            <h1 className="pageTitle">
              <span className="pageTitleIcon">
                <MonoIcon className="pageTitleGlyph">
                  <path d="M12 21s6-4.7 6-10a6 6 0 10-12 0c0 5.3 6 10 6 10z" />
                  <circle cx="12" cy="11" r="2.2" />
                </MonoIcon>
              </span>
              Site Management
            </h1>
            <p className="subtitle responsiveSubtitle">
              Manage locations where devices are deployed.
            </p>
          </div>
        </div>

        <div className="s-stack responsiveStack">
          <section className="cards responsiveCards responsiveSection">
            <div className="card">
              <div className="cardIcon">
                <MonoIcon>
                  <path d="M12 21s6-4.7 6-10a6 6 0 10-12 0c0 5.3 6 10 6 10z" />
                  <circle cx="12" cy="11" r="2.2" />
                </MonoIcon>
              </div>
              <div className="cardContent">
                <div className="cardValue">{totalSites}</div>
                <div className="cardLabel">Total Sites</div>
              </div>
            </div>

            <div className="card">
              <div className="cardIcon">
                <MonoIcon>
                  <circle cx="12" cy="12" r="8" />
                </MonoIcon>
              </div>
              <div className="cardContent">
                <div className="cardValue">{activeSites}</div>
                <div className="cardLabel">Active Sites</div>
              </div>
            </div>

            <div className="card">
              <div className="cardIcon">
                <MonoIcon>
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <path d="M8 20h8" />
                  <path d="M12 16v4" />
                </MonoIcon>
              </div>
              <div className="cardContent">
                <div className="cardValue">{totalDevices}</div>
                <div className="cardLabel">Total Devices</div>
              </div>
            </div>

            <div className="card">
              <div className="cardIcon">
                <MonoIcon>
                  <path d="M3 21h18" />
                  <path d="M5 21V9l6 3V9l8-4v16" />
                </MonoIcon>
              </div>
              <div className="cardContent">
                <div className="cardValue">{sitesWithDevices}</div>
                <div className="cardLabel">Sites With Devices</div>
              </div>
            </div>
          </section>

          <section className="panel responsivePanel responsiveSection">
            <div className="panelHeader">
              <h2>Sites</h2>

              <div className="panelHeaderActions responsiveActions">
                <button
                  className="topEditBtn"
                  onClick={() => setShowAdd(true)}
                >
                  Add Site
                </button>
              </div>
            </div>

            <div className="tableWrap responsiveTableWrap">
              <table className="table responsiveTable">
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
                      <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                        Loading sites...
                      </td>
                    </tr>
                  ) : sites.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                        No sites found.
                      </td>
                    </tr>
                  ) : (
                    sites.map((s) => (
                      <tr key={s.site_id}>
                        <td>{s.site_code}</td>
                        <td className="strong">{s.site_name}</td>
                        <td>{s.location || "-"}</td>
                        <td>{s.technician_name || "-"}</td>
                        <td>{getDeviceCount(s.site_id)}</td>
                        <td>
                          <button
                            className="siteEditBtn"
                            onClick={() => setEditSite(s)}
                          >
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

          <footer className="footer responsiveFooter">
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