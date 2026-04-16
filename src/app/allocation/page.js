"use client";

import { useState, useEffect, useMemo } from "react";
import AppNavHead from "../components/appNavHead";
import "../components/appNavHead.css";
import "../components/cards.css";
import "./allocation.css";
import "@/app/styles/responsive.css";
import { API_BASE } from "@/lib/apiBase";

export default function AllocationPage() {
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [search, setSearch] = useState("");

  const [sites, setSites] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  async function fetchSites() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sites`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setSites(data);
    } catch (err) {
      console.error("Error fetching sites:", err);
    }
  }

  async function fetchTechnicians() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const techs = data.filter((user) => user.role_id === 2);
      setTechnicians(techs);
    } catch (err) {
      console.error("Error fetching technicians:", err);
    }
  }

  useEffect(() => {
    fetchSites();
    fetchTechnicians();
  }, []);

  const handleSave = async () => {
    if (!selectedSite || !selectedTech) {
      setMessage({ text: "Please select both a technician and a site.", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/sites/assign-site`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          site_id: selectedSite,
          technician_id: selectedTech,
        }),
      });

      setMessage({ text: "✓ Allocation saved successfully!", type: "success" });
      setSelectedSite("");
      setSelectedTech("");
      fetchSites();
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    }
  };

  /* Group sites per technician */
  const allocationList = technicians.map((tech) => {
    const assignedSites = sites
      .filter((site) => site.technician_id === tech.user_id)
      .map((site) => site.site_name);

    return {
      id: tech.user_id,
      name: tech.name,
      initials: tech.name
        ? tech.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??",
      sites: assignedSites,
    };
  });

  /* Stats */
  const totalTechs = technicians.length;
  const activeTechs = allocationList.filter((t) => t.sites.length > 0).length;
  const totalSites = sites.length;

  /* Filtered list */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allocationList;
    return allocationList.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.sites.some((s) => s.toLowerCase().includes(q))
    );
  }, [allocationList, search]);

  return (
    <AppNavHead active="allocation">
      <div className="allocationPage responsivePage">

        {/* ───── HERO ───── */}
        <section className="allocationHero">
          <p className="kicker">Operations Control</p>
          <div className="heroTop">
            <h1>Technician Allocation</h1>
            <span className="allocBadge">{activeTechs} active assignments</span>
          </div>
          <p className="heroLead">
            Assign field technicians to operational sites and manage your workforce deployment from one centralised panel.
          </p>
          <div className="heroRail" aria-hidden="true" />
        </section>

        {/* ───── STATS ───── */}
<section className="userCards responsiveSection" aria-label="Allocation statistics">
  <div className="userCard">
    <div className="userCardIcon">
      <svg
        viewBox="0 0 24 24"
        className="userCardGlyph"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8v6" />
        <path d="M23 11h-6" />
      </svg>
    </div>
    <div>
      <div className="userCardValue">{totalTechs}</div>
      <div className="userCardLabel">Total Technicians</div>
    </div>
  </div>

  <div className="userCard">
    <div className="userCardIcon">
      <svg
        viewBox="0 0 24 24"
        className="userCardGlyph"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>
    <div>
      <div className="userCardValue">{activeTechs}</div>
      <div className="userCardLabel">Active Assignments</div>
    </div>
  </div>

  <div className="userCard">
    <div className="userCardIcon">
      <svg
        viewBox="0 0 24 24"
        className="userCardGlyph"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 10h.01" />
        <path d="M9 14h.01" />
        <path d="M9 18h.01" />
        <path d="M15 10h.01" />
        <path d="M15 14h.01" />
        <path d="M15 18h.01" />
      </svg>
    </div>
    <div>
      <div className="userCardValue">{totalSites}</div>
      <div className="userCardLabel">Total Sites</div>
    </div>
  </div>
</section>

        {/* ───── FORM CARD ───── */}
        <div className="allocFormCard">
          <div className="allocFormHead">
            <h2>Assign Technician to Site</h2>
            <span className="chip">Quick Assign</span>
          </div>

          {message.text && (
            <div className={`allocMsg ${message.type}`}>{message.text}</div>
          )}

          <div className="allocFormBody">
            <div className="allocField">
              <label htmlFor="techSelect">Select Technician</label>
              <select
                id="techSelect"
                className="allocSelect"
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
              >
                <option value="">Choose a technician…</option>
                {technicians.map((tech) => (
                  <option key={tech.user_id} value={tech.user_id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="allocField">
              <label htmlFor="siteSelect">Assign Site</label>
              <select
                id="siteSelect"
                className="allocSelect"
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
              >
                <option value="">Choose a site…</option>
                {sites.map((site) => (
                  <option key={site.site_id} value={site.site_id}>
                    {site.site_name}
                  </option>
                ))}
              </select>
            </div>

            <button className="allocSaveBtn" onClick={handleSave}>
              Save Allocation
            </button>
          </div>
        </div>

        {/* ───── TABLE ───── */}
        <div className="allocTableCard">
          <div className="allocTableHead">
            <h2>Current Allocations</h2>
            <input
              className="allocSearch"
              placeholder="🔍  Search technician or site…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="allocTableWrap">
            <table className="allocTable">
              <thead>
                <tr>
                  <th>Technician</th>
                  <th>Sites Assigned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="3">
                      <div className="allocEmptyState">
                        <div className="allocEmptyIcon">🔗</div>
                        <p>
                          {search
                            ? "No results match your search."
                            : "No technicians found. Add users to get started."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Technician">
                        <div className="techNameCell">
                          <div className="techAvatar">{item.initials}</div>
                          <strong>{item.name}</strong>
                        </div>
                      </td>

                      <td data-label="Sites Assigned">
                        {item.sites.length === 0 ? (
                          <span className="allocTag none">No sites assigned</span>
                        ) : (
                          item.sites.map((site, i) => (
                            <span key={i} className="allocTag assigned">
                              {site}
                            </span>
                          ))
                        )}
                      </td>

                      <td data-label="Status">
                        <span
                          className={`allocStatus ${
                            item.sites.length > 0 ? "active" : "inactive"
                          }`}
                        >
                          {item.sites.length > 0 ? "ACTIVE" : "UNASSIGNED"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="allocFooter">
          © 2026 Blue Giant Equipment Corporation
        </footer>

      </div>
    </AppNavHead>
  );
}
