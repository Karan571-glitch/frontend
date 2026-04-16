"use client";

import { useEffect, useState } from "react";
import AppNavHead from "../components/appNavHead";
import "./reports.css";
import "@/app/styles/responsive.css";
import { API_BASE, getAuthHeaders } from "@/lib/apiBase";

function MonoIcon({ children, className = "repGlyph" }) {
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

export default function ReportsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      const url     = `${API_BASE}/api/firmware`;
      const headers = { Accept: "application/json", ...getAuthHeaders() };

      try {
        const res  = await fetch(url, { headers });
        const text = await res.text();
        let data;

        try { data = text ? JSON.parse(text) : null; }
        catch { if (!cancelled) setRows([]); return; }

        if (!res.ok || !Array.isArray(data)) {
          if (!cancelled) setRows([]);
          return;
        }

        const formatted = data.map((f) => ({
          id:      f.firmware_id,
          device:  f.devices_using > 0 ? `${f.devices_using} device${f.devices_using !== 1 ? "s" : ""}` : "—",
          site:    f.site_name || "N/A",
          version: f.version,
          status:  f.devices_using > 0 ? "success" : "neutral",
          time:    new Date(f.uploaded_at).toLocaleString(),
        }));

        if (!cancelled) setRows(formatted);
      } catch {
        if (!cancelled) setRows([]);
      }
    }

    loadReports();
    return () => { cancelled = true; };
  }, []);

  const stats = {
    total:   rows.length,
    success: rows.filter((r) => r.status === "success").length,
    failed:  rows.filter((r) => r.status === "failed").length,
  };

  function handleGenerateReport() {
    if (!rows.length) { alert("No data to export"); return; }

    const headers = ["Device", "Site", "Version", "Status", "Last Update"];
    const csvData = rows.map((r) => [r.device, r.site, r.version, r.status, r.time]);
    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `reports-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const pillLabel = { success: "Success", failed: "Failed", neutral: "Pending" };

  return (
    <AppNavHead active="reports">
      <div className="reportsWrapper responsivePage">

        {/* ───── HERO ───── */}
        <section className="reportsHero">
          <p className="repKicker">Operations Control</p>
          <div className="repHeroTop">
            <h1>Reports Management</h1>
            <span className="repHeroBadge">{stats.total} report{stats.total !== 1 ? "s" : ""} available</span>
          </div>
          <p className="repHeroLead">
            View, filter, and export firmware update activity across all sites. Track deployment success rates and identify issues at a glance.
          </p>
          <div className="repHeroRail" aria-hidden="true" />
        </section>

        <div className="responsiveStack">

          {/* ───── STAT CARDS ───── */}
          <section className="repCards responsiveSection" aria-label="Report statistics">

            <div className="repCard">
              <div className="repCardIcon">
                <MonoIcon>
                  <path d="M4 19V9" /><path d="M10 19V5" />
                  <path d="M16 19v-7" /><path d="M22 19v-4" />
                </MonoIcon>
              </div>
              <div>
                <div className="repCardValue">{stats.total}</div>
                <div className="repCardLabel">Total Reports</div>
              </div>
            </div>

            <div className="repCard">
              <div className="repCardIcon">
                <MonoIcon><path d="M20 6L9 17l-5-5" /></MonoIcon>
              </div>
              <div>
                <div className="repCardValue">{stats.success}</div>
                <div className="repCardLabel">Successful</div>
              </div>
            </div>

            <div className="repCard">
              <div className="repCardIcon">
                <MonoIcon>
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </MonoIcon>
              </div>
              <div>
                <div className="repCardValue">{stats.failed}</div>
                <div className="repCardLabel">Failed</div>
              </div>
            </div>

          </section>

          {/* ───── TABLE PANEL ───── */}
          <section className="repPanel responsiveSection">
            <div className="repPanelHead">
              <h2>All Reports</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span className="repChip">Live</span>
                <button className="repGenerateBtn" onClick={handleGenerateReport}>
                  ↓ Export CSV
                </button>
              </div>
            </div>

            <div className="repTableWrap">
              <table className="repTable">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Site</th>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        <div className="repEmptyState">
                          <div className="repEmptyIcon">📊</div>
                          <p>No reports found. Upload firmware to generate activity data.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id}>
                        <td data-label="Device">{r.device}</td>
                        <td data-label="Site">{r.site}</td>
                        <td data-label="Version">
                          <span className="repVersion">{r.version}</span>
                        </td>
                        <td data-label="Status">
                          <span className={`repPill ${r.status}`}>
                            {pillLabel[r.status] || r.status}
                          </span>
                        </td>
                        <td data-label="Last Update">{r.time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="repFooter responsiveFooter">
            © {new Date().getFullYear()} Blue Giant Equipment Corporation
          </footer>

        </div>
      </div>
    </AppNavHead>
  );
}
