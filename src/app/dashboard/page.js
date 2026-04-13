"use client";

import "./dashboard.css";
import { useEffect, useState } from "react";
import "@/app/components/cards.css";
import "@/app/styles/responsive.css";
import AppShell from "@/app/components/appNavHead";
import { API_BASE, getAuthHeaders } from "@/lib/apiBase";

/* ─── Stat card icon ─── */
function StatIcon({ children }) {
  return (
    <svg viewBox="0 0 24 24" className="dashCardGlyph" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

/* ─── AI Insight — inline, no external import ─── */
function AIInsightCard() {
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");

  async function handleAnalyze() {
    if (!deviceId.trim()) { setError("Please enter a Device ID or Device Code."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`${API_BASE}/api/ai/insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ device_id: deviceId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to get AI insight."); return; }
      setResult(data);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="dashAiCard">
      {/* Header */}
      <div className="dashAiHead">
        <div>
          <h2 className="dashAiTitle">AI Insights</h2>
          <p className="dashAiSub">
            Get a health summary, anomaly flag, and maintenance recommendation from the latest telemetry data.
          </p>
        </div>
        <span className="dashAiChip">Beta</span>
      </div>

      {/* Body */}
      <div className="dashAiBody">
        <label className="dashAiLabel" htmlFor="dashAiInput">
          Device ID / Device Code
        </label>
        <div className="dashAiInputRow">
          <input
            id="dashAiInput"
            className="dashAiInput"
            placeholder='e.g. "12" or "DEV-001"'
            value={deviceId}
            onChange={(e) => { setDeviceId(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          />
          <button className="dashAiBtn" onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing…" : "Analyze"}
          </button>
        </div>

        {error && <div className="dashAiAlert error">{error}</div>}

        {result && (
          <div className="dashAiResult">
            {result.health_summary && (
              <div className="dashAiResultBlock">
                <span className="dashAiResultLabel">Health Summary</span>
                <p className="dashAiResultText">{result.health_summary}</p>
              </div>
            )}
            {result.anomaly_flag !== undefined && (
              <div className="dashAiResultBlock">
                <span className="dashAiResultLabel">Anomaly Detected</span>
                <span className={`dashAiPill ${result.anomaly_flag ? "warn" : "ok"}`}>
                  {result.anomaly_flag ? "⚠ Yes" : "✓ No"}
                </span>
              </div>
            )}
            {result.recommendation && (
              <div className="dashAiResultBlock">
                <span className="dashAiResultLabel">Recommendation</span>
                <p className="dashAiResultText">{result.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN DASHBOARD PAGE
═══════════════════════════════════════ */
export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_devices: 0,
    total_sites: 0,
    total_firmware: 0,
    total_users: 0,
  });
  const [firmwareRows, setFirmwareRows]   = useState([]);
  const [firmwareError, setFirmwareError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      try {
        const [statsRes, firmwareRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard/stats`),
          fetch(`${API_BASE}/api/firmware`, {
            headers: { Accept: "application/json", ...getAuthHeaders() },
          }),
        ]);

        const statsData     = await statsRes.json();
        const firmwareText  = await firmwareRes.text();
        let firmwareData;

        try { firmwareData = firmwareText ? JSON.parse(firmwareText) : null; }
        catch {
          if (!ignore) { setFirmwareError("Invalid response from firmware API."); setFirmwareRows([]); }
          return;
        }

        if (!ignore) {
          setStats(statsData);

          if (!firmwareRes.ok) {
            setFirmwareError(
              firmwareData?.message || firmwareData?.error?.message ||
              `Error fetching firmware (${firmwareRes.status})`
            );
            setFirmwareRows([]);
            return;
          }

          if (!Array.isArray(firmwareData)) {
            setFirmwareError("Invalid firmware response: not an array.");
            setFirmwareRows([]);
            return;
          }

          setFirmwareError("");
          setFirmwareRows(firmwareData);
        }
      } catch (err) {
        if (!ignore) {
          setFirmwareError(err?.message || "Cannot reach firmware API. Check backend and NEXT_PUBLIC_API_URL.");
          setFirmwareRows([]);
        }
      }
    }

    loadDashboardData();
    return () => { ignore = true; };
  }, []);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <AppShell active="dashboard">
      <div className="responsivePage">

        {/* ───── HERO ───── */}
        <section className="dashboardHero">
          <p className="dashKicker">Operations Control</p>
          <div className="dashHeroTop">
            <h1>Dashboard Overview</h1>
            <span className="dashLiveBadge">Live · {today}</span>
          </div>
          <p className="dashHeroLead">
            Monitor your devices, sites, firmware versions, and system health at a glance. All key metrics updated in real time.
          </p>
          <div className="dashHeroRail" aria-hidden="true" />
        </section>

        <div className="responsiveStack">

          {/* ───── STAT CARDS ───── */}
          <section className="dashCards responsiveSection" aria-label="Key metrics">

            <div className="dashCard">
              <div className="dashCardIcon">
                <StatIcon>
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <path d="M8 20h8" /><path d="M12 16v4" />
                </StatIcon>
              </div>
              <div>
                <div className="dashCardValue">{stats.total_devices}</div>
                <div className="dashCardLabel">Total Devices</div>
              </div>
            </div>

            <div className="dashCard">
              <div className="dashCardIcon">
                <StatIcon>
                  <path d="M12 21s6-4.7 6-10a6 6 0 10-12 0c0 5.3 6 10 6 10z" />
                  <circle cx="12" cy="11" r="2.2" />
                </StatIcon>
              </div>
              <div>
                <div className="dashCardValue">{stats.total_sites}</div>
                <div className="dashCardLabel">Total Sites</div>
              </div>
            </div>

            <div className="dashCard">
              <div className="dashCardIcon">
                <StatIcon>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1 1 0 00.2 1.1l.1.1a1 1 0 010 1.4l-1.3 1.3a1 1 0 01-1.4 0l-.1-.1a1 1 0 00-1.1-.2 1 1 0 00-.6.9V20a1 1 0 01-1 1h-1.8a1 1 0 01-1-1v-.2a1 1 0 00-.6-.9 1 1 0 00-1.1.2l-.1.1a1 1 0 01-1.4 0L4.9 18a1 1 0 010-1.4l.1-.1a1 1 0 00.2-1.1 1 1 0 00-.9-.6H4a1 1 0 01-1-1V12a1 1 0 011-1h.2a1 1 0 00.9-.6 1 1 0 00-.2-1.1l-.1-.1a1 1 0 010-1.4L6.1 6a1 1 0 011.4 0l.1.1a1 1 0 001.1.2 1 1 0 00.6-.9V5a1 1 0 011-1h1.8a1 1 0 011 1v.2a1 1 0 00.6.9 1 1 0 001.1-.2l.1-.1a1 1 0 011.4 0l1.3 1.3a1 1 0 010 1.4l-.1.1a1 1 0 00-.2 1.1 1 1 0 00.9.6h.2a1 1 0 011 1v1.8a1 1 0 01-1 1h-.2a1 1 0 00-.9.6z" />
                </StatIcon>
              </div>
              <div>
                <div className="dashCardValue">{stats.total_firmware}</div>
                <div className="dashCardLabel">Firmware Versions</div>
              </div>
            </div>

            <div className="dashCard">
              <div className="dashCardIcon">
                <StatIcon>
                  <path d="M12 3L2 21h20L12 3z" />
                  <path d="M12 9v5" />
                  <circle cx="12" cy="17" r="1" />
                </StatIcon>
              </div>
              <div>
                <div className="dashCardValue">{stats.total_users}</div>
                <div className="dashCardLabel">Update Failures</div>
              </div>
            </div>

          </section>

          {/* ───── AI INSIGHT ───── */}
          <AIInsightCard />

          {/* ───── FIRMWARE TABLE ───── */}
          <section className="dashPanel responsiveSection">
            <div className="dashPanelHead">
              <h2>Firmware Versions</h2>
              <span className="dashChip">Live</span>
            </div>

            <div className="dashTableWrap">
              {firmwareError && (
                <p className="dashError" role="alert">{firmwareError}</p>
              )}
              <table className="dashTable">
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
                  {firmwareRows.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        <div className="dashEmptyState">
                          <div className="dashEmptyIcon">📦</div>
                          <p>No firmware uploaded yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    firmwareRows.map((r) => (
                      <tr key={r.firmware_id}>
                        <td data-label="Version">
                          <span className="dashFwVersion">{r.version}</span>
                        </td>
                        <td data-label="Upload Date">
                          {new Date(r.uploaded_at).toLocaleDateString()}
                        </td>
                        <td data-label="Site">{r.site_name || "N/A"}</td>
                        <td data-label="Devices Using">{r.devices_using}</td>
                        <td data-label="Status">
                          <span className="dashPill active">Active</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="dashFooter responsiveFooter">
            © {new Date().getFullYear()} Blue Giant Equipment Corporation
          </footer>

        </div>
      </div>
    </AppShell>
  );
}
