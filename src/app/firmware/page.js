"use client";

import { useMemo, useState, useEffect } from "react";
import AppNavHead from "@/app/components/appNavHead";
import "@/app/styles/responsive.css";
import "./firmware.css";
import "@/app/components/cards.css";
import { API_BASE, getAuthHeaders } from "@/lib/apiBase";

export default function FirmwarePage() {
  const [version, setVersion] = useState("");
  const [file, setFile]       = useState(null);
  const [siteId, setSiteId]   = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState({ text: "", type: "" });

  const [sites, setSites]               = useState([]);
  const [rows, setRows]                 = useState([]);
  const [firmwareLoadError, setFirmwareLoadError] = useState("");

  const fileName = useMemo(() => (file ? file.name : "No file chosen"), [file]);

  /* ─── Initial load ─── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      setFirmwareLoadError("You are not logged in. Open this page after signing in.");
      return;
    }
    fetchSites();
    fetchFirmware();
  }, []);

  /* ─── Fetch sites ─── */
  async function fetchSites() {
    try {
      const res  = await fetch(`${API_BASE}/sites`, { headers: { ...getAuthHeaders() } });
      const data = await res.json();
      setSites(data);
    } catch (err) {
      console.error("Sites error:", err);
    }
  }

  /* ─── Fetch firmware ─── */
  async function fetchFirmware() {
    const url     = `${API_BASE}/api/firmware`;
    const headers = { Accept: "application/json", ...getAuthHeaders() };
    setFirmwareLoadError("");

    try {
      const res  = await fetch(url, { headers });
      const text = await res.text();
      let data;

      try { data = text ? JSON.parse(text) : null; }
      catch {
        setFirmwareLoadError("Invalid response from firmware API.");
        setRows([]);
        return;
      }

      if (!res.ok) {
        setFirmwareLoadError(
          data?.message || data?.error?.message || `Error fetching firmware (${res.status})`
        );
        setRows([]);
        return;
      }

      if (!Array.isArray(data)) {
        setFirmwareLoadError("Invalid firmware response: not an array.");
        setRows([]);
        return;
      }

      setRows(data);
    } catch (err) {
      setFirmwareLoadError(
        err?.message || "Cannot reach firmware API. Check backend and NEXT_PUBLIC_API_URL."
      );
      setRows([]);
    }
  }

  /* ─── Upload ─── */
  async function handleUpload(e) {
    e.preventDefault();
    setUploadMsg({ text: "", type: "" });

    if (!version.trim()) { setUploadMsg({ text: "Please enter a firmware version.", type: "error" }); return; }
    if (!file)           { setUploadMsg({ text: "Please select a firmware file.", type: "error" }); return; }
    if (!siteId)         { setUploadMsg({ text: "Please select a site.", type: "error" }); return; }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("version", version);
      formData.append("uploaded_by", 1);
      formData.append("description", "Firmware upload");
      formData.append("site_id", siteId);

      const token    = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/firmware/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Upload failed");

      setUploadMsg({ text: "✓ Firmware uploaded successfully!", type: "success" });
      setVersion(""); setFile(null); setSiteId("");
      fetchFirmware();
      setTimeout(() => setUploadMsg({ text: "", type: "" }), 4000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMsg({ text: error.message || "Error uploading firmware.", type: "error" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppNavHead active="firmware">
      <div className="responsivePage">

        {/* ───── HERO ───── */}
        <section className="fwHero">
          <p className="fwKicker">Operations Control</p>
          <div className="fwHeroTop">
            <h1>Firmware Management</h1>
            <span className="fwHeroBadge">{rows.length} version{rows.length !== 1 ? "s" : ""} available</span>
          </div>
          <p className="fwHeroLead">
            Upload, track, and manage firmware versions across all operational sites. Keep your device fleet current and compliant.
          </p>
          <div className="fwHeroRail" aria-hidden="true" />
        </section>

        <div className="responsiveStack">

          {/* ───── MAIN GRID: upload form | table ───── */}
          <div className="fwGrid">

            {/* ── Upload Panel ── */}
            <div className="fwPanel">
              <div className="fwPanelHead">
                <h2>Upload Firmware</h2>
                <span className="fwChip">New</span>
              </div>
              <div className="fwPanelBody">

                {uploadMsg.text && (
                  <div className={`fwAlert ${uploadMsg.type}`}>{uploadMsg.text}</div>
                )}

                <form className="fwForm" onSubmit={handleUpload}>

                  <div className="fwField">
                    <label className="fwFieldLabel">Firmware Version</label>
                    <input
                      className="fwInput"
                      placeholder="e.g., v1.0.5"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                    />
                  </div>

                  <div className="fwField">
                    <label className="fwFieldLabel">Target Site</label>
                    <select
                      className="fwSelect"
                      value={siteId}
                      onChange={(e) => setSiteId(e.target.value)}
                    >
                      <option value="">Choose a site…</option>
                      {sites.map((site) => (
                        <option key={site.site_id} value={site.site_id}>
                          {site.site_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="fwField">
                    <label className="fwFieldLabel">Firmware File</label>
                    <div className="fwFileRow">
                      <label className="fwFileBtn">
                        Choose File
                        <input
                          type="file"
                          className="fwFileInput"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      <span className={`fwFileName${file ? " hasFile" : ""}`}>
                        {fileName}
                      </span>
                    </div>
                  </div>

                  <button className="fwUploadBtn" type="submit" disabled={uploading}>
                    {uploading ? "Uploading…" : "Upload Firmware"}
                  </button>
                </form>
              </div>
            </div>

            {/* ── Table Panel ── */}
            <div className="fwPanel">
              <div className="fwPanelHead">
                <h2>Available Versions</h2>
                <span className="fwChip">Live</span>
              </div>

              {firmwareLoadError && (
                <div className="fwAlert error" style={{ margin: "16px 22px 0" }} role="alert">
                  {firmwareLoadError}
                </div>
              )}

              <div className="fwTableWrap">
                <table className="fwTable">
                  <thead>
                    <tr>
                      <th>Version</th>
                      <th>Upload Date</th>
                      <th>Site</th>
                      <th>Devices Using</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="5">
                          <div className="fwEmptyState">
                            <div className="fwEmptyIcon">📦</div>
                            <p>No firmware uploaded yet. Use the form to add the first version.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rows.map((r) => (
                        <tr key={r.firmware_id}>
                          <td data-label="Version">
                            <span className="fwVersion">{r.version}</span>
                          </td>
                          <td data-label="Upload Date">
                            {new Date(r.uploaded_at).toLocaleDateString()}
                          </td>
                          <td data-label="Site">{r.site_name || "N/A"}</td>
                          <td data-label="Devices Using">{r.devices_using}</td>
                          <td data-label="Status">
                            <span className="fwPill fw-active">Active</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>{/* /fwGrid */}

          <footer className="fwFooter responsiveFooter">
            © {new Date().getFullYear()} Blue Giant Equipment Corporation
          </footer>

        </div>
      </div>
    </AppNavHead>
  );
}
