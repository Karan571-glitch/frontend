"use client";

import { useMemo, useState, useEffect } from "react";
import AppNavHead from "@/app/components/appNavHead";
import "@/app/styles/responsive.css";
import "./firmware.css";
import "@/app/components/cards.css";
import { API_BASE, getAuthHeaders } from "@/lib/apiBase";

export default function FirmwarePage() {
  const [version, setVersion] = useState("");
  const [file, setFile] = useState(null);
  const [siteId, setSiteId] = useState("");

  const [sites, setSites] = useState([]);
  const [rows, setRows] = useState([]);
  const [firmwareLoadError, setFirmwareLoadError] = useState("");

  const fileName = useMemo(() => (file ? file.name : "No file chosen"), [file]);

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      setFirmwareLoadError(
        "You are not logged in. Open this page after signing in.",
      );
      return;
    }
    fetchSites();
    fetchFirmware();
  }, []);

  /* =========================
     FETCH SITES (REAL)
  ========================= */
  async function fetchSites() {
    try {
      const res = await fetch(`${API_BASE}/sites`, {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      setSites(data);
    } catch (err) {
      console.error("Sites error:", err);
    }
  }

  /* =========================
     FETCH FIRMWARE (REAL)
     Backend: GET /api/firmware (requires Bearer token, roles 1 or 2)
  ========================= */
  async function fetchFirmware() {
    const url = `${API_BASE}/api/firmware`;
    const headers = { Accept: "application/json", ...getAuthHeaders() };

    setFirmwareLoadError("");
    console.log("[firmware fetchFirmware] URL:", url);
    console.log(
      "[firmware fetchFirmware] Authorization:",
      headers.Authorization ? "Bearer ***" : "(missing — sign in; endpoint requires JWT)",
    );

    try {
      const res = await fetch(url, { headers });
      console.log("[firmware fetchFirmware] status:", res.status, res.statusText);

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        console.error("[firmware fetchFirmware] non-JSON body:", text.slice(0, 200));
        setFirmwareLoadError("Invalid response from firmware API.");
        setRows([]);
        return;
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error?.message ||
          `Error fetching firmware (${res.status})`;
        console.error("[firmware fetchFirmware] API error:", msg);
        setFirmwareLoadError(msg);
        setRows([]);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("[firmware fetchFirmware] expected array, got:", data);
        setFirmwareLoadError("Invalid firmware response: not an array.");
        setRows([]);
        return;
      }

      setRows(data);
    } catch (err) {
      console.error("[firmware fetchFirmware] network/error:", err?.message || err);
      setFirmwareLoadError(
        "Cannot reach firmware API. Check backend and NEXT_PUBLIC_API_URL.",
      );
      setRows([]);
    }
  }

  /* =========================
     UPLOAD
  ========================= */
  async function handleUpload(e) {
    e.preventDefault();

    if (!version.trim()) {
      alert("Enter version");
      return;
    }

    if (!file) {
      alert("Select file");
      return;
    }

    if (!siteId) {
      alert("Select site");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("version", version);
      formData.append("uploaded_by", 1);
      formData.append("description", "Firmware upload");
      formData.append("site_id", siteId);

      const token = localStorage.getItem("token"); // 🪪 get ID card

      const response = await fetch(`${API_BASE}/api/firmware/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // 🪪 show ID card
        },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      alert("Firmware uploaded successfully!");

      setVersion("");
      setFile(null);
      setSiteId("");

      // 🔥 refresh table
      fetchFirmware();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading firmware.");
    }
  }

  return (
    <AppNavHead active="firmware">
      <div className="responsivePage">
        <h1 className="fw-titleCenter">🖥️ Firmware Management</h1>

        <div className="responsiveStack">
          {/* =========================
              UPLOAD SECTION
          ========================= */}
          <section className="fw-card responsiveSection">
            <h2 className="fw-card-title">Upload New Firmware</h2>

            <form className="fw-form" onSubmit={handleUpload}>
              <label className="fw-label">Firmware Version</label>
              <input
                className="fw-input"
                placeholder="e.g., 1.0.5"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />

              <label className="fw-label">Select Site</label>
              <select
                className="fw-input"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
              >
                <option value="">-- Select Site --</option>

                {sites.map((site) => (
                  <option key={site.site_id} value={site.site_id}>
                    {site.site_name}
                  </option>
                ))}
              </select>

              <label className="fw-label">Select Firmware File</label>

              <div className="fw-fileRow">
                <label className="fw-fileBtn">
                  Choose File
                  <input
                    type="file"
                    className="fw-fileInput"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>

                <div className="fw-fileName">{fileName}</div>
              </div>

              <button className="fw-primaryBtn" type="submit">
                Upload Firmware
              </button>
            </form>
          </section>

          {/* =========================
              TABLE SECTION
          ========================= */}
          <section className="fw-card responsiveSection">
            <h2 className="fw-bigTitle">Available Firmware Versions</h2>

            <div className="fw-tableWrap responsiveTableWrap">
              {firmwareLoadError && (
                <p
                  style={{
                    color: "#b91c1c",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                  role="alert"
                >
                  {firmwareLoadError}
                </p>
              )}
              <table className="fw-table responsiveTable">
                <thead>
                  <tr>
                    <th>VERSION</th>
                    <th>UPLOAD DATE</th>
                    <th>SITE</th>
                    <th>DEVICES USING</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        No firmware uploaded yet
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.firmware_id}>
                        <td className="fw-tdVersion" data-label="Version">{r.version}</td>

                        <td data-label="Upload Date">{new Date(r.uploaded_at).toLocaleDateString()}</td>

                        <td data-label="Site">{r.site_name || "N/A"}</td>

                        <td data-label="Devices Using">{r.devices_using}</td>

                        <td data-label="Status">
                          <span className="fw-pill fw-active">-</span>
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
      </div>
    </AppNavHead>
  );
}
