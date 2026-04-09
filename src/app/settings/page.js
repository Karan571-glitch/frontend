"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/app/components/appNavHead";
import "./settings.css";
import { API_BASE } from "@/lib/apiBase";

const defaultSettings = {
  fullName: "",
  email: "",
  phone: "",
  timezone: "America/Toronto",
  language: "English",
  facility: "Central Operations Hub",
  mfaEnabled: true,
  sessionTimeout: "30",
  loginAlerts: true,
  maintenanceAlerts: true,
  firmwareAlerts: true,
  weeklySummary: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE}/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;

        const user = data.user || data;
        setSettings((prev) => ({
          ...prev,
          fullName: user?.name || prev.fullName,
          email: user?.email || prev.email,
        }));
      })
      .catch((err) => console.error("Settings user fetch failed:", err));
  }, []);

  const completion = useMemo(() => {
    const required = [settings.fullName, settings.email, settings.phone, settings.facility];
    const completeCount = required.filter(Boolean).length;
    return Math.round((completeCount / required.length) * 100);
  }, [settings]);

  function onFieldChange(event) {
    const { name, value, type, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);

    // Placeholder for backend integration once settings API exists.
    await new Promise((resolve) => setTimeout(resolve, 700));

    setSaving(false);
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }

  return (
    <AppShell active="settings">
      <div className="settingsPage responsivePage">
        <section className="settingsHero">
          <p className="kicker">Operations Control</p>
          <div className="heroTop">
            <h1>Settings</h1>
            <span className="profileMeter">Profile completeness: {completion}%</span>
          </div>
          <p className="heroLead">
            Configure your organization profile, security posture, and operational alerts in one place.
          </p>
          <div className="heroRail" aria-hidden="true" />
        </section>

        <section className="settingsCards" aria-label="Configuration categories">
          <article className="settingsCard">
            <h2>Account Profile</h2>
            <p>Control identity details, language, and site-level preferences for your team.</p>
          </article>
          <article className="settingsCard">
            <h2>Security Center</h2>
            <p>Harden access with multi-factor controls, session boundaries, and sign-in alerts.</p>
          </article>
          <article className="settingsCard">
            <h2>Signal & Reports</h2>
            <p>Decide which maintenance and firmware events trigger notifications.</p>
          </article>
        </section>

        <form className="settingsGrid" onSubmit={handleSave}>
          <section className="settingsPanel">
            <div className="panelHead">
              <h3>Account & Operations</h3>
              <span className="chip">Core</span>
            </div>

            <div className="formGrid twoCol">
              <label className="field">
                <span>Full name</span>
                <input
                  name="fullName"
                  value={settings.fullName}
                  onChange={onFieldChange}
                  placeholder="Enter full name"
                  required
                />
              </label>

              <label className="field">
                <span>Business email</span>
                <input
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={onFieldChange}
                  placeholder="name@company.com"
                  required
                />
              </label>

              <label className="field">
                <span>Phone</span>
                <input
                  name="phone"
                  value={settings.phone}
                  onChange={onFieldChange}
                  placeholder="+1 (555) 010-1100"
                />
              </label>

              <label className="field">
                <span>Primary facility</span>
                <input
                  name="facility"
                  value={settings.facility}
                  onChange={onFieldChange}
                  placeholder="Facility name"
                />
              </label>

              <label className="field">
                <span>Timezone</span>
                <select name="timezone" value={settings.timezone} onChange={onFieldChange}>
                  <option value="America/Toronto">America/Toronto</option>
                  <option value="America/Edmonton">America/Edmonton</option>
                  <option value="America/Vancouver">America/Vancouver</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </label>

              <label className="field">
                <span>Language</span>
                <select name="language" value={settings.language} onChange={onFieldChange}>
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </label>
            </div>
          </section>

          <section className="settingsPanel">
            <div className="panelHead">
              <h3>Security Controls</h3>
              <span className="chip">Protected</span>
            </div>

            <div className="switchStack">
              <label className="switchRow">
                <div>
                  <strong>Enable multi-factor authentication</strong>
                  <p>Require secondary verification during login for privileged users.</p>
                </div>
                <input
                  name="mfaEnabled"
                  type="checkbox"
                  checked={settings.mfaEnabled}
                  onChange={onFieldChange}
                />
              </label>

              <label className="field inlineField">
                <span>Session timeout (minutes)</span>
                <select name="sessionTimeout" value={settings.sessionTimeout} onChange={onFieldChange}>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="60">60</option>
                  <option value="120">120</option>
                </select>
              </label>

              <label className="switchRow">
                <div>
                  <strong>Login anomaly alerts</strong>
                  <p>Notify admins when there are unusual sign-in locations or behavior.</p>
                </div>
                <input
                  name="loginAlerts"
                  type="checkbox"
                  checked={settings.loginAlerts}
                  onChange={onFieldChange}
                />
              </label>
            </div>
          </section>

          <section className="settingsPanel fullWidth">
            <div className="panelHead">
              <h3>Alert Routing</h3>
              <span className="chip">Live</span>
            </div>

            <div className="toggleGrid">
              <label className="switchRow compact">
                <div>
                  <strong>Maintenance alerts</strong>
                  <p>Receive service notices and due inspections.</p>
                </div>
                <input
                  name="maintenanceAlerts"
                  type="checkbox"
                  checked={settings.maintenanceAlerts}
                  onChange={onFieldChange}
                />
              </label>

              <label className="switchRow compact">
                <div>
                  <strong>Firmware rollout alerts</strong>
                  <p>Notify teams when updates are available or delayed.</p>
                </div>
                <input
                  name="firmwareAlerts"
                  type="checkbox"
                  checked={settings.firmwareAlerts}
                  onChange={onFieldChange}
                />
              </label>

              <label className="switchRow compact">
                <div>
                  <strong>Weekly operations summary</strong>
                  <p>Digest of uptime, deployments, and active incidents.</p>
                </div>
                <input
                  name="weeklySummary"
                  type="checkbox"
                  checked={settings.weeklySummary}
                  onChange={onFieldChange}
                />
              </label>
            </div>
          </section>

          <section className="settingsFooter">
            <button type="submit" className="saveBtn" disabled={saving}>
              {saving ? "Saving..." : "Save settings"}
            </button>
            <p className="saveHint">
              {savedAt ? `Last updated at ${savedAt}` : "Changes are stored locally until backend settings API is connected."}
            </p>
          </section>
        </form>
      </div>
    </AppShell>
  );
}
