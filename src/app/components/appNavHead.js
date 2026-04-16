"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./appNavHead.css";
import { usePathname } from "next/navigation";
import { API_BASE } from "@/lib/apiBase";
import { getImageUrl } from "@/lib/getImageURL";

function NavIcon({ children }) {
  return (
    <span className="navIcon" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="navGlyph" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

function UserGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="userGlyph"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" />
    </svg>
  );
}

export default function AppShell({ active = "dashboard", children }) {
  const [user, setUser] = useState({ name: "", profile_picture: null });
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user || data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (!e.target.closest(".userMenu")) setMenuOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  // Get initials from name for fallback avatar
  function getInitials(name) {
    if (!name) return "BG";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");
  }

  return (
    <div className={`dashPage ${collapsed ? "collapsed" : ""} ${mobileNavOpen ? "mobileNavOpen" : ""}`}>
      <header className="topHeader">
        <div className="headerLeft">
          <button
            className="hamburger"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle navigation"
            type="button"
          >
            {mobileNavOpen ? "✕" : "☰"}
          </button>
          <img src="/logo-white.svg" alt="Blue Giant Logo" className="headerLogo" />
        </div>

        <div className="userMenu">
          <button
            className="userBtn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            type="button"
          >
            {/* ── Avatar: profile picture or initials fallback ── */}
            <div className="userIcon">
{user.profile_picture ? (
  <img
    src={getImageUrl(user.profile_picture)}
    alt={user.name || "Profile"}
    className="headerAvatar"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
) : (
  <span className="headerInitials">
    {getInitials(user.name)}
  </span>
)}
            </div>
            <span className="userName">{user.name || "User"}</span>
            <span className={`chev ${menuOpen ? "open" : ""}`}>▾</span>
          </button>

          {menuOpen && (
            <div className="dropdown" role="menu">
              <Link className="ddItem" href="/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>

              <button className="ddItem danger" onClick={handleLogout} type="button">
                Logout
              </button>
              <Link className="ddItem" href="/help">
                Help
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="dashLayout">
        {mobileNavOpen && (
          <div className="mobileOverlay" onClick={() => setMobileNavOpen(false)} />
        )}
        <aside
          className="sidebar"
          onMouseEnter={() => setCollapsed(false)}
          onMouseLeave={() => setCollapsed(true)}
        >
          <div className="collapseBtn">
            <button
              type="button"
              className="collapseBtnInner"
              onClick={() => setCollapsed((v) => !v)}
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            >
              {collapsed ? "›" : "‹"}
            </button>
          </div>

          <div className="nav">
            <Link className={`navItem ${pathname === "/dashboard" ? "active" : ""}`} href="/dashboard" onClick={() => setMobileNavOpen(false)}>
              <NavIcon>
                <path d="M3 10.5L12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5" />
              </NavIcon>
              <span className="navText">Dashboard</span>
            </Link>

            <Link className={`navItem ${pathname === "/firmware" ? "active" : ""}`} href="/firmware" onClick={() => setMobileNavOpen(false)}>
              <NavIcon>
                <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" />
                <path d="M3 7.5V16.5L12 21l9-4.5V7.5" />
                <path d="M12 12v9" />
              </NavIcon>
              <span className="navText">Firmware</span>
            </Link>

            <Link className={`navItem ${pathname === "/devices" ? "active" : ""}`} href="/devices" onClick={() => setMobileNavOpen(false)}>
              <NavIcon>
                <rect x="3" y="4" width="18" height="12" rx="2" />
                <path d="M8 20h8" />
                <path d="M12 16v4" />
              </NavIcon>
              <span className="navText">Devices</span>
            </Link>

            <Link className={`navItem ${pathname === "/sites" ? "active" : ""}`} href="/sites" onClick={() => setMobileNavOpen(false)}>
              <NavIcon>
                <path d="M12 21s6-4.7 6-10a6 6 0 10-12 0c0 5.3 6 10 6 10z" />
                <circle cx="12" cy="11" r="2.2" />
              </NavIcon>
              <span className="navText">Sites</span>
            </Link>

            <Link className={`navItem ${pathname === "/users" ? "active" : ""}`} href="/users" onClick={() => setMobileNavOpen(false)}>
              <NavIcon>
                <circle cx="9" cy="8" r="2.8" />
                <circle cx="16.5" cy="9.5" r="2.2" />
                <path d="M4.5 19c0-3 2.3-5 5.5-5s5.5 2 5.5 5" />
                <path d="M14 19c.1-1.9 1.4-3.4 3.5-3.9" />
              </NavIcon>
              <span className="navText">Users</span>
            </Link>

            <Link className={`navItem ${pathname === "/allocation" ? "active" : ""}`} href="/allocation" onClick={() => setMobileNavOpen(false)}>
              <NavIcon>
                <path d="M10.6 13.4l2.8-2.8" />
                <path d="M8.2 15.8l-1.4 1.4a3 3 0 01-4.2-4.2L6 9.6a3 3 0 014.2 0" />
                <path d="M15.8 8.2l1.4-1.4a3 3 0 014.2 4.2L18 14.4a3 3 0 01-4.2 0" />
              </NavIcon>
              <span className="navText">Allocation</span>
            </Link>

            <Link className={`navItem ${pathname === "/reports" ? "active" : ""}`} href="/reports" onClick={() => setMobileNavOpen(false)}>
              <NavIcon>
                <path d="M4 20h16" />
                <rect x="6" y="11" width="2.8" height="7" rx="1" />
                <rect x="10.6" y="8" width="2.8" height="10" rx="1" />
                <rect x="15.2" y="5" width="2.8" height="13" rx="1" />
              </NavIcon>
              <span className="navText">Reports</span>
            </Link>
          </div>
        </aside>

        <main className="main">{children}</main>
      </div>
    </div>
  );
}
