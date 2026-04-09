"use client";

import "./dashboard.css";
import { useEffect, useState } from "react";
import "@/app/components/cards.css";
import "@/app/styles/responsive.css";
import AppShell from "@/app/components/appNavHead";
import { API_BASE, getAuthHeaders } from "@/lib/apiBase";
import AIInsightCard from "@/app/components/dashboard/AIInsightCard";

function StatIcon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="cardIconGlyph"
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

function TitleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="titleIconGlyph"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19v-4" />
    </svg>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_devices: 0,
    total_sites: 0,
    total_firmware: 0,
    total_users: 0,
  });

  const [firmwareRows, setFirmwareRows] = useState([]);
  const [firmwareError, setFirmwareError] = useState("");

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  }

  async function fetchFirmware() {
    const url = `${API_BASE}/api/firmware`;
    const headers = { Accept: "application/json", ...getAuthHeaders() };

    console.log("[dashboard fetchFirmware] URL:", url);
    console.log(
      "[dashboard fetchFirmware] Authorization present:",
      Boolean(headers.Authorization)
    );

    setFirmwareError("");

    try {
      const res = await fetch(url, { headers });
      console.log(
        "[dashboard fetchFirmware] status:",
        res.status,
        res.statusText
      );

      const text = await res.text();
      let data;

      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        console.error(
          "[dashboard fetchFirmware] non-JSON body:",
          text.slice(0, 200)
        );
        setFirmwareError("Invalid response from firmware API.");
        setFirmwareRows([]);
        return;
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error?.message ||
          `Error fetching firmware (${res.status})`;

        console.error("[dashboard fetchFirmware] API error:", msg, data);
        setFirmwareError(msg);
        setFirmwareRows([]);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("[dashboard fetchFirmware] expected array, got:", data);
        setFirmwareError("Invalid firmware response: not an array.");
        setFirmwareRows([]);
        return;
      }

      setFirmwareRows(data);
    } catch (err) {
      console.error("[dashboard fetchFirmware] network/error:", err);
      setFirmwareError(
        err?.message ||
          "Cannot reach firmware API. Check backend and NEXT_PUBLIC_API_URL."
      );
      setFirmwareRows([]);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      try {
        const [statsRes, firmwareRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard/stats`),
          fetch(`${API_BASE}/api/firmware`, {
            headers: {
              Accept: "application/json",
              ...getAuthHeaders(),
            },
          }),
        ]);

        const statsData = await statsRes.json();

        const firmwareText = await firmwareRes.text();
        let firmwareData;

        try {
          firmwareData = firmwareText ? JSON.parse(firmwareText) : null;
        } catch (parseErr) {
          if (!ignore) {
            setFirmwareError("Invalid response from firmware API.");
            setFirmwareRows([]);
          }
          return;
        }

        if (!ignore) {
          setStats(statsData);

          if (!firmwareRes.ok) {
            const msg =
              firmwareData?.message ||
              firmwareData?.error?.message ||
              `Error fetching firmware (${firmwareRes.status})`;

            setFirmwareError(msg);
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
        console.error("[dashboard load] error:", err);

        if (!ignore) {
          setFirmwareError(
            err?.message ||
              "Cannot reach firmware API. Check backend and NEXT_PUBLIC_API_URL."
          );
          setFirmwareRows([]);
        }
      }
    }

    loadDashboardData();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AppShell active="dashboard">
      <div className="responsivePage">
        <div className="titleRow">
          <div className="titleIcon">
            <TitleIcon />
          </div>
          <h1 className="pageTitle">Dashboard Overview</h1>
        </div>

        <div className="devices-divider"></div>

        <div className="responsiveStack">
          <section className="cards responsiveCards responsiveSection">
            <div className="card">
              <div className="cardIcon">
                <StatIcon>
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <path d="M8 20h8" />
                  <path d="M12 16v4" />
                </StatIcon>
              </div>
              <div>
                <div className="cardValue">{stats.total_devices}</div>
                <div className="cardLabel">Total Devices</div>
              </div>
            </div>

            <div className="card">
              <div className="cardIcon">
                <StatIcon>
                  <path d="M12 21s6-4.7 6-10a6 6 0 10-12 0c0 5.3 6 10 6 10z" />
                  <circle cx="12" cy="11" r="2.2" />
                </StatIcon>
              </div>
              <div>
                <div className="cardValue">{stats.total_sites}</div>
                <div className="cardLabel">Total Sites</div>
              </div>
            </div>

            <div className="card">
              <div className="cardIcon">
                <StatIcon>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1 1 0 00.2 1.1l.1.1a1 1 0 010 1.4l-1.3 1.3a1 1 0 01-1.4 0l-.1-.1a1 1 0 00-1.1-.2 1 1 0 00-.6.9V20a1 1 0 01-1 1h-1.8a1 1 0 01-1-1v-.2a1 1 0 00-.6-.9 1 1 0 00-1.1.2l-.1.1a1 1 0 01-1.4 0L4.9 18a1 1 0 010-1.4l.1-.1a1 1 0 00.2-1.1 1 1 0 00-.9-.6H4a1 1 0 01-1-1V12a1 1 0 011-1h.2a1 1 0 00.9-.6 1 1 0 00-.2-1.1l-.1-.1a1 1 0 010-1.4L6.1 6a1 1 0 011.4 0l.1.1a1 1 0 001.1.2 1 1 0 00.6-.9V5a1 1 0 011-1h1.8a1 1 0 011 1v.2a1 1 0 00.6.9 1 1 0 001.1-.2l.1-.1a1 1 0 011.4 0l1.3 1.3a1 1 0 010 1.4l-.1.1a1 1 0 00-.2 1.1 1 1 0 00.9.6h.2a1 1 0 011 1v1.8a1 1 0 01-1 1h-.2a1 1 0 00-.9.6z" />
                </StatIcon>
              </div>
              <div>
                <div className="cardValue">{stats.total_firmware}</div>
                <div className="cardLabel">Firmware Versions</div>
              </div>
            </div>

            <div className="card">
              <div className="cardIcon">
                <StatIcon>
                  <path d="M12 3L2 21h20L12 3z" />
                  <path d="M12 9v5" />
                  <circle cx="12" cy="17" r="1" />
                </StatIcon>
              </div>
              <div>
                <div className="cardValue">{stats.total_users}</div>
                <div className="cardLabel">Update Failures</div>
              </div>
            </div>
          </section>

          <AIInsightCard />

          <section className="panel responsivePanel responsiveSection">
            <div className="panelHeader">
              <h2>Firmware Versions</h2>
              <span className="dots">⋯</span>
            </div>

            <div className="tableWrap responsiveTableWrap">
              {firmwareError && (
                <p
                  style={{
                    color: "#b91c1c",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                  role="alert"
                >
                  {firmwareError}
                </p>
              )}

              <table className="table responsiveTable">
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
                  {firmwareRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No firmware uploaded yet
                      </td>
                    </tr>
                  ) : (
                    firmwareRows.map((r) => (
                      <tr key={r.firmware_id}>
                        <td className="fw-tdVersion">{r.version}</td>
                        <td>{new Date(r.uploaded_at).toLocaleDateString()}</td>
                        <td>{r.site_name || "N/A"}</td>
                        <td>{r.devices_using}</td>
                        <td>
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
    </AppShell>
  );
}