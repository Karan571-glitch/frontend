"use client";

import { useEffect, useState } from "react";
import AppNavHead from "../components/appNavHead";
import "./reports.css";
import "@/app/styles/responsive.css";
import { API_BASE, getAuthHeaders } from "@/lib/apiBase";

function MonoIcon({ children, className = "reportGlyph" }) {
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

// eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      const url = `${API_BASE}/api/firmware`;
      const headers = { Accept: "application/json", ...getAuthHeaders() };

      try {
        const res = await fetch(url, { headers });
        const text = await res.text();

        let data;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          if (!cancelled) setRows([]);
          return;
        }

        if (!res.ok || !Array.isArray(data)) {
          if (!cancelled) setRows([]);
          return;
        }

        const formatted = data.map((f) => ({
          id: f.firmware_id,
          device: f.devices_using > 0 ? `${f.devices_using} devices` : "-",
          site: f.site_name || "N/A",
          version: f.version,
          status: "-",
          time: new Date(f.uploaded_at).toLocaleString(),
        }));

        if (!cancelled) {
          setRows(formatted);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
        }
      }
    }

    loadReports();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = {
    total: rows.length,
    success: 0,
    failed: 0,
  };

  const handleGenerateReport = () => {
    if (!rows.length) {
      alert("No data to export");
      return;
    }

    const headers = ["Device", "Site", "Version", "Status", "Last Update"];

    const csvData = rows.map((r) => [
      r.device,
      r.site,
      r.version,
      r.status,
      r.time,
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `reports-${new Date().toISOString().slice(0, 10)}.csv`
    );

    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppNavHead active="reports">
      <div className="reportsWrapper responsivePage">
        <div className="sitesHeader responsiveHeader">
          <div>
            <h1 className="pageTitle">
              <div className="pageTitleIcon">
                <MonoIcon className="pageTitleGlyph">
                  <path d="M4 19V9" />
                  <path d="M10 19V5" />
                  <path d="M16 19v-7" />
                  <path d="M22 19v-4" />
                </MonoIcon>
              </div>
              Reports Management
            </h1>
            <p className="subtitle responsiveSubtitle">
              View and analyze system update activities.
            </p>
          </div>
        </div>

        <div className="responsiveStack">
          <section className="cards reportsCards responsiveSection">
            <div className="card">
              <div className="cardIcon">
                <MonoIcon>
                  <path d="M4 19V9" />
                  <path d="M10 19V5" />
                  <path d="M16 19v-7" />
                  <path d="M22 19v-4" />
                </MonoIcon>
              </div>
              <div className="cardContent">
                <div className="cardValue">{stats.total}</div>
                <div className="cardLabel">Total Reports</div>
              </div>
            </div>

            <div className="card">
              <div className="cardIcon">
                <MonoIcon>
                  <path d="M20 6L9 17l-5-5" />
                </MonoIcon>
              </div>
              <div className="cardContent">
                <div className="cardValue">{stats.success}</div>
                <div className="cardLabel">Successful</div>
              </div>
            </div>

            <div className="card">
              <div className="cardIcon">
                <MonoIcon>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </MonoIcon>
              </div>
              <div className="cardContent">
                <div className="cardValue">{stats.failed}</div>
                <div className="cardLabel">Failed</div>
              </div>
            </div>
          </section>

          <section className="panel responsivePanel responsiveSection">
            <div className="tableHeader">
              <h2>Reports</h2>

              <button className="addBtn" onClick={handleGenerateReport}>
                Generate Report
              </button>
            </div>

            <div className="responsiveTableWrap" style={{ padding: "12px" }}>
              <table className="responsiveTable">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Site</th>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Last Update</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="noData">
                        No reports found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id}>
                        <td>{r.device}</td>
                        <td>{r.site}</td>
                        <td>{r.version}</td>
                        <td>
                          <span className="status">{r.status}</span>
                        </td>
                        <td>{r.time}</td>
                        <td>
                          <button className="viewBtn">View</button>
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