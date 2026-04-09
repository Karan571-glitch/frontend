"use client";

import { useMemo, useState } from "react";
import { API_BASE, getAuthHeaders } from "@/lib/apiBase";

function badgeClasses(status) {
  switch (status) {
    case "ok":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "critical":
      return "bg-red-50 text-red-700 ring-red-200";
    case "warning":
    default:
      return "bg-amber-50 text-amber-800 ring-amber-200";
  }
}

function safeJsonParse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(text.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export default function AIInsightCard({ defaultDeviceId = "" }) {
  const [deviceId, setDeviceId] = useState(defaultDeviceId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [insight, setInsight] = useState(null);

  const hasToken = useMemo(() => Boolean(getAuthHeaders().Authorization), []);

  async function runAnalysis() {
    const id = String(deviceId || "").trim();
    if (!id) {
      setError("Enter a Device ID or Device Code to analyze.");
      return;
    }

    const url = `${API_BASE}/api/ai/analyze-device/${encodeURIComponent(id)}`;
    console.log("AI request URL:", url);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    };

    console.log("[AIInsight] URL:", url);
    console.log("[AIInsight] Authorization present:", Boolean(headers.Authorization));

    setLoading(true);
    setError("");
    setInsight(null);

    try {
      const res = await fetch(url, { method: "POST", headers });
      console.log("[AIInsight] status:", res.status, res.statusText);

      const text = await res.text();
      const data = safeJsonParse(text);

      if (!data) {
        setError("Invalid response from AI service (not JSON).");
        return;
      }

      if (!res.ok) {
        setError(data.message || data.error?.message || "AI analysis failed.");
        return;
      }

      setInsight(data);
    } catch (e) {
      console.error("[AIInsight] request error:", e);
      setError("Unable to reach AI service. Check backend and API base URL.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel responsivePanel responsiveSection">
      <div className="panelHeader">
        <h2>AI Insights</h2>
        <span className="dots">⋯</span>
      </div>

      <div className="tableWrap responsiveTableWrap">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Device ID / Device Code
              </label>
              <input
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder='e.g. "12" or "DEV-001"'
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={runAnalysis}
              disabled={loading || !hasToken}
              className="inline-flex items-center justify-center rounded-lg bg-[#005696] px-4 py-2 text-sm font-extrabold text-white disabled:opacity-60"
              title={!hasToken ? "Login required" : "Analyze latest telemetry"}
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>

          {!hasToken && (
            <p className="text-sm font-semibold text-amber-700" role="alert">
              Login required to fetch AI insights (missing token).
            </p>
          )}

          {error && (
            <p className="text-sm font-semibold text-red-700" role="alert">
              {error}
            </p>
          )}

          {!error && !insight && !loading && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Enter a device and click Analyze to get a health summary,
                anomaly flag, and maintenance recommendation from the latest telemetry.
              </p>
            </div>
          )}

          {insight && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${badgeClasses(
                    insight.status,
                  )}`}
                >
                  {String(insight.status || "warning").toUpperCase()}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Risk:{" "}
                  <span className="font-extrabold text-slate-800">
                    {String(insight.risk_level || "medium")}
                  </span>
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Anomaly:{" "}
                  <span className="font-extrabold text-slate-800">
                    {insight.anomaly_detected ? "Yes" : "No"}
                  </span>
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-xs font-extrabold text-slate-700 mb-1">
                    Summary
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {insight.summary || "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-extrabold text-slate-700 mb-1">
                    Recommendation
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {insight.recommendation || "-"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

