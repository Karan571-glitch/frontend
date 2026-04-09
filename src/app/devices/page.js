"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import "./devices.css";
import "@/app/components/cards.css";
import "@/app/styles/responsive.css";
import AppShell from "@/app/components/appNavHead";
import { API_BASE, getAuthHeaders } from "@/lib/apiBase";

function MonoIcon({ children, className = "deviceGlyph" }) {
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

function StatusPill({ status }) {
  const map = {
    active: { cls: "success", label: "Active" },
    inactive: { cls: "failed", label: "Inactive" },
    maintenance: { cls: "warn", label: "Maintenance" },
  };

  const { cls, label } = map[status] || {
    cls: "failed",
    label: status || "Unknown",
  };

  return <span className={`pill ${cls}`}>{label}</span>;
}

function AddDeviceModal({ onClose, onSuccess, sites }) {
  const [form, setForm] = useState({
    device_name: "",
    device_code: "",
    site_id: "",
    device_type: "",
    status: "active",
    firmware_version: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.device_name.trim() || !form.device_code.trim() || !form.site_id) {
      setError("Device name, code and site are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/devices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...form,
          site_id: Number(form.site_id),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create device");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalWrapper title="Add Device" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field
          label="Device Name"
          value={form.device_name}
          placeholder="e.g., Sensor Unit A"
          onChange={(e) => update("device_name", e.target.value)}
        />

        <Field
          label="Device Code"
          value={form.device_code}
          placeholder="e.g., DEV-001"
          onChange={(e) => update("device_code", e.target.value)}
        />

        <div className="twoCol">
          <div className="field">
            <label className="label">Site</label>
            <select
              className="select"
              value={form.site_id}
              onChange={(e) => update("site_id", e.target.value)}
            >
              <option value="">Select Site</option>
              {sites.map((s) => (
                <option key={s.site_id} value={s.site_id}>
                  {s.site_name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label">Device Type</label>
            <input
              className="input"
              value={form.device_type}
              placeholder="e.g., sensor, controller"
              onChange={(e) => update("device_type", e.target.value)}
            />
          </div>
        </div>

        <div className="twoCol">
          <div className="field">
            <label className="label">Status</label>
            <select
              className="select"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <Field
            label="Firmware Version"
            value={form.firmware_version}
            placeholder="e.g., v1.2.0"
            onChange={(e) => update("firmware_version", e.target.value)}
          />
        </div>

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

function EditDeviceModal({ device, onClose, onSuccess, sites }) {
  const [form, setForm] = useState({
    device_name: device.device_name || "",
    device_code: device.device_code || "",
    site_id: device.site_id || "",
    device_type: device.device_type || "",
    status: device.status || "active",
    firmware_version: device.firmware_version || "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSave() {
    setError("");

    if (!form.device_name.trim() || !form.device_code.trim() || !form.site_id) {
      setError("Device name, code and site are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/devices/${device.device_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...form,
          site_id: Number(form.site_id),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Update failed");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setError("");

    if (!confirm("Are you sure you want to delete this device?")) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/devices/${device.device_id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });

      if (!res.ok) {
        setError("Delete failed. Please try again.");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalWrapper title="Edit Device" onClose={onClose}>
      <Field
        label="Device Name"
        value={form.device_name}
        placeholder="e.g., Sensor Unit A"
        onChange={(e) => update("device_name", e.target.value)}
      />

      <Field
        label="Device Code"
        value={form.device_code}
        placeholder="e.g., DEV-001"
        onChange={(e) => update("device_code", e.target.value)}
      />

      <div className="twoCol">
        <div className="field">
          <label className="label">Site</label>
          <select
            className="select"
            value={form.site_id}
            onChange={(e) => update("site_id", e.target.value)}
          >
            <option value="">Select Site</option>
            {sites.map((s) => (
              <option key={s.site_id} value={s.site_id}>
                {s.site_name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label">Device Type</label>
          <input
            className="input"
            value={form.device_type}
            placeholder="e.g., sensor, controller"
            onChange={(e) => update("device_type", e.target.value)}
          />
        </div>
      </div>

      <div className="twoCol">
        <div className="field">
          <label className="label">Status</label>
          <select
            className="select"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <Field
          label="Firmware Version"
          value={form.firmware_version}
          placeholder="e.g., v1.2.0"
          onChange={(e) => update("firmware_version", e.target.value)}
        />
      </div>

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

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function fetchSites() {
      try {
        const url = `${API_BASE}/sites`;
        const headers = { ...getAuthHeaders() };

        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!cancelled) {
          setSites(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setSites([]);
        }
      }
    }

    fetchSites();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function fetchDevices() {
      setLoading(true);

      const url = selectedSite
        ? `${API_BASE}/devices?site_id=${selectedSite}`
        : `${API_BASE}/devices`;

      try {
        const res = await fetch(url, {
          headers: { ...getAuthHeaders() },
        });

        const data = await res.json();

        if (!cancelled) {
          setDevices(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setDevices([]);
          setLoading(false);
        }
      }
    }

    fetchDevices();

    return () => {
      cancelled = true;
    };
  }, [selectedSite, refreshKey]);

  const totalDevices = devices.length;
  const activeDevices = useMemo(
    () => devices.filter((d) => d.status === "active").length,
    [devices]
  );
  const offlineDevices = useMemo(
    () => devices.filter((d) => d.status === "inactive").length,
    [devices]
  );
  const maintenanceDevices = useMemo(
    () => devices.filter((d) => d.status === "maintenance").length,
    [devices]
  );

  return (
    <AppShell active="devices">
      <div className="devicesPage responsivePage">
        <div className="devicesHeader responsiveHeader">
          <div>
            <h1 className="pageTitle">
              <span className="pageTitleIcon">
                <MonoIcon className="pageTitleGlyph">
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <path d="M8 20h8" />
                  <path d="M12 16v4" />
                </MonoIcon>
              </span>
              Device Management
            </h1>
            <p className="subtitle responsiveSubtitle">
              Manage and monitor devices across all sites.
            </p>
          </div>
        </div>

        <div className="d-stack responsiveStack">
          <section className="cards responsiveCards responsiveSection">
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
                  <circle cx="12" cy="12" r="8" />
                </MonoIcon>
              </div>
              <div className="cardContent">
                <div className="cardValue">{activeDevices}</div>
                <div className="cardLabel">Active</div>
              </div>
            </div>

            <div className="card">
              <div className="cardIcon">
                <MonoIcon>
                  <circle cx="12" cy="12" r="8" />
                  <path d="M8.5 8.5l7 7" />
                </MonoIcon>
              </div>
              <div className="cardContent">
                <div className="cardValue">{offlineDevices}</div>
                <div className="cardLabel">Offline</div>
              </div>
            </div>

            <div className="card">
              <div className="cardIcon">
                <MonoIcon>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1 1 0 00.2 1.1l.1.1a1 1 0 010 1.4l-1.3 1.3a1 1 0 01-1.4 0l-.1-.1a1 1 0 00-1.1-.2 1 1 0 00-.6.9V20a1 1 0 01-1 1h-1.8a1 1 0 01-1-1v-.2a1 1 0 00-.6-.9 1 1 0 00-1.1.2l-.1.1a1 1 0 01-1.4 0L4.9 18a1 1 0 010-1.4l.1-.1a1 1 0 00.2-1.1 1 1 0 00-.9-.6H4a1 1 0 01-1-1V12a1 1 0 011-1h.2a1 1 0 00.9-.6 1 1 0 00-.2-1.1l-.1-.1a1 1 0 010-1.4L6.1 6a1 1 0 011.4 0l.1.1a1 1 0 001.1.2 1 1 0 00.6-.9V5a1 1 0 011-1h1.8a1 1 0 011 1v.2a1 1 0 00.6.9 1 1 0 001.1-.2l.1-.1a1 1 0 011.4 0l1.3 1.3a1 1 0 010 1.4l-.1.1a1 1 0 00-.2 1.1 1 1 0 00.9.6h.2a1 1 0 011 1v1.8a1 1 0 01-1 1h-.2a1 1 0 00-.9.6z" />
                </MonoIcon>
              </div>
              <div className="cardContent">
                <div className="cardValue">{maintenanceDevices}</div>
                <div className="cardLabel">Maintenance</div>
              </div>
            </div>
          </section>

          <section className="panel responsivePanel responsiveSection">
            <div className="panelHeader">
              <h2>Devices</h2>

              <div className="panelHeaderActions">
                <select
                  className="select"
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                >
                  <option value="">All Sites</option>
                  {sites.map((s) => (
                    <option key={s.site_id} value={s.site_id}>
                      {s.site_name}
                    </option>
                  ))}
                </select>

                <button
                  className="TtopEditBtn"
                  onClick={() => setShowAdd(true)}
                >
                  Add device
                </button>
              </div>
            </div>

            <div className="tableWrap responsiveTableWrap">
              <table className="table responsiveTable">
                <thead>
                  <tr>
                    <th>Device Code</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Site name</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: 24 }}>
                        Loading devices...
                      </td>
                    </tr>
                  ) : devices.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: 24 }}>
                        No devices found.
                      </td>
                    </tr>
                  ) : (
                    devices.map((d) => (
                      <tr key={d.device_id}>
                        <td>
                          <span>{d.device_code}</span>
                        </td>
                        <td className="strong">{d.device_name}</td>
                        <td>{d.device_type || "-"}</td>
                        <td>
                          <StatusPill status={d.status} />
                        </td>
                        <td>{d.site_name || "-"}</td>
                        <td>
                          <button
                            className="siteEditBtn"
                            onClick={() => setEditDevice(d)}
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
      </div>
    </AppShell>
  );
}