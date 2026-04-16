"use client";

import { useState, useEffect, useMemo } from "react";
import AppNavHead from "../components/appNavHead";
import "../components/appNavHead.css";
import "../components/cards.css";
import "./allocation.css";
import "@/app/styles/responsive.css";
import { API_BASE } from "@/lib/apiBase";

/* ─── Icon helper ─── */
function AllocIcon({ children, className = "allocStatGlyph" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function AllocationPage() {
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const [message, setMessage]           = useState({ text: "", type: "" });
  const [search, setSearch]             = useState("");
  const [sites, setSites]               = useState([]);
  const [technicians, setTechnicians]   = useState([]);

  async function fetchSites() {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/sites`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setSites(data);
    } catch (err) { console.error("Error fetching sites:", err); }
  }

  async function fetchTechnicians() {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setTechnicians(data.filter((user) => user.role_id === 2));
    } catch (err) { console.error("Error fetching technicians:", err); }
  }

  useEffect(() => { fetchSites(); fetchTechnicians(); }, []);

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
        body: JSON.stringify({ site_id: selectedSite, technician_id: selectedTech }),
      });
      setMessage({ text: "✓ Allocation saved successfully!", type: "success" });
      setSelectedSite(""); setSelectedTech("");
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

  const totalTechs  = technicians.length;
  const activeTechs = allocationList.filter((t) => t.sites.length > 0).length;
  const totalSites  = sites.length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allocationList;
    return allocationList.filter(
      (t) => t.name.toLowerCase().includes(q) ||
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

        {/* ───── STAT CARDS — matching Sites/Users/Dashboard ───── */}
        <div className="allocStats">

          <div className="allocStat">
            <div className="allocStatIcon">
              <AllocIcon>
                {/* people/group icon */}
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </AllocIcon>
            </div>
            <div>
              <div className="allocStatValue">{totalTechs}</div>
              <div className="allocStatLabel">Total Technicians</div>
            </div>
          </div>

          <div className="allocStat">
            <div className="allocStatIcon">
              <AllocIcon>
                {/* link/chain icon */}
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </AllocIcon>
            </div>
            <div>
              <div className="allocStatValue">{activeTechs}</div>
              <div className="allocStatLabel">Active Assignments</div>
            </div>
          </div>

          <div className="allocStat">
            <div className="allocStatIcon">
              <AllocIcon>
                {/* location/pin icon */}
                <path d="M12 21s6-4.7 6-10a6 6 0 10-12 0c0 5.3 6 10 6 10z" />
                <circle cx="12" cy="11" r="2.2" />
              </AllocIcon>
            </div>
            <div>
              <div className="allocStatValue">{totalSites}</div>
              <div className="allocStatLabel">Total Sites</div>
            </div>
          </div>

        </div>

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
              <select id="techSelect" className="allocSelect"
                value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}>
                <option value="">Choose a technician…</option>
                {technicians.map((tech) => (
                  <option key={tech.user_id} value={tech.user_id}>{tech.name}</option>
                ))}
              </select>
            </div>

            <div className="allocField">
              <label htmlFor="siteSelect">Assign Site</label>
              <select id="siteSelect" className="allocSelect"
                value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)}>
                <option value="">Choose a site…</option>
                {sites.map((site) => (
                  <option key={site.site_id} value={site.site_id}>{site.site_name}</option>
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
            <input className="allocSearch" placeholder="🔍  Search technician or site…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
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
                        <p>{search ? "No results match your search." : "No technicians found. Add users to get started."}</p>
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
                            <span key={i} className="allocTag assigned">{site}</span>
                          ))
                        )}
                      </td>
                      <td data-label="Status">
                        <span className={`allocStatus ${item.sites.length > 0 ? "active" : "inactive"}`}>
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
          © {new Date().getFullYear()} Blue Giant Equipment Corporation
        </footer>

      </div>
    </AppNavHead>
  );
}

