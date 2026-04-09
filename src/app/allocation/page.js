"use client";

import { useState, useEffect } from "react";
import AppNavHead from "../components/appNavHead";
import "../components/appNavHead.css";
import "../components/cards.css";
import "./allocation.css";
import "@/app/styles/responsive.css";
import { API_BASE } from "@/lib/apiBase";

export default function AllocationPage() {

  const [selectedSite, setSelectedSite] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const [message, setMessage] = useState("");

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

      const techs = data.filter(user => user.role_id === 2);
      setTechnicians(techs);

    } catch (err) {
      console.error("Error fetching technicians:", err);
    }
  }

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    fetchSites();
    fetchTechnicians();
  }, []);

  /* =========================
     SAVE ALLOCATION
  ========================= */
  const handleSave = async () => {
    if (!selectedSite || !selectedTech) {
      setMessage("Please select at least one site");
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

      setMessage("Allocation saved successfully!");

      fetchSites(); // refresh table

      setTimeout(() => setMessage(""), 3000);

    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     GROUP DATA FOR TABLE
  ========================= */

  const allocationList = technicians.map(tech => {
    const assignedSites = sites
      .filter(site => site.technician_id === tech.user_id)
      .map(site => site.site_name);

    return {
      technician_name: tech.name,
      sites: assignedSites,
    };
  });

  return (
    <AppNavHead active="allocation">

      <div className="allocationContainer responsivePage">

        <div className="responsiveHeader">
          <div>
            <h1 className="pageTitle">
              <span className="pageTitleIcon">🔗</span>
              Technician Allocation
            </h1>
          </div>
        </div>

        {message && <p className="errorMsg">{message}</p>}

        <div className="responsiveStack">

        {/* ================= TOP CARD ================= */}
        <div className="allocationCard responsiveSection">

          {/* LEFT */}
          <div className="allocationLeft">
            <h3>Select Technician</h3>

            <select
              className="dropdownSelect"
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
            >
              <option value="">Select Technician</option>

              {technicians.map((tech) => (
                <option key={tech.user_id} value={tech.user_id}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>

          {/* RIGHT */}
          <div className="allocationRight">
            <h3>Assign Sites</h3>

            <select
              className="dropdownSelect"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
            >
              <option value="">Select Sites</option>

              {sites.map((site) => (
                <option key={site.site_id} value={site.site_id}>
                  {site.site_name}
                </option>
              ))}
            </select>

            <div className="btnWrapper">
              <button className="btnPrimary" onClick={handleSave}>
                Save Allocation
              </button>
            </div>
          </div>

        </div>

        {/* ================= TABLE ================= */}
        <div className="allocationTable responsiveSection">

          <div className="tableHeader">
            <h2>Current Allocations</h2>
            {/* <input placeholder="🔍 Search ..." className="search" /> */}
          </div>

          <div className="responsiveTableWrap">
          <table className="table responsiveTable">
            <thead>
              <tr>
                <th>TECHNICIAN</th>
                <th>SITES ASSIGNED</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {allocationList.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No technicians found
                  </td>
                </tr>
              ) : (
                allocationList.map((item, index) => (
                  <tr key={index}>
                    <td data-label="Technician">{item.technician_name}</td>

                    <td data-label="Sites Assigned">
                      {item.sites.length === 0 ? (
                        <span className="tag">No Sites</span>
                      ) : (
                        item.sites.map((site, i) => (
                          <span key={i} className="tag active">
                            {site}
                          </span>
                        ))
                      )}
                    </td>

                    <td data-label="Status">
                      <span className="status active">
                        {item.sites.length > 0 ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
          </div>

        </div>

          <footer className="responsiveFooter">
            © 2026 Blue Giant Equipment Corporation
          </footer>

        </div>

      </div>

    </AppNavHead>
  );
}
