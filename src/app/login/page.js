"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/apiBase";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  const handleLogin = async () => {
    setError("");

    const url = `${API_BASE}/auth/login`;
    console.log("[login] POST", url);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          password,
        }),
      });

      console.log("[login] response", res.status, res.statusText);

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error("[login] Non-JSON body (wrong URL/port?)", text.slice(0, 300));
        setError(
          "Invalid response from server. Is the backend running on the URL in NEXT_PUBLIC_API_URL?",
        );
        return;
      }

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("[login] fetch failed", err);
      setError(
        `Cannot reach API at ${API_BASE}. Start the backend and check NEXT_PUBLIC_API_URL.`,
      );
    }
  };

  const handleForgotPassword = async () => {
    setResetError("");
    setResetMessage("");

    if (!resetEmail.trim()) {
      setResetError("Please enter your email address.");
      return;
    }

    const url = `${API_BASE}/api/forgot-password`;
    console.log("[forgot-password] POST", url);

    try {
      setResetLoading(true);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      console.log("[forgot-password] response", res.status, res.statusText);

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error(
          "[forgot-password] Non-JSON body",
          text.slice(0, 300),
        );
        setResetError(
          "Invalid response from server. Check API URL or whether this endpoint exists.",
        );
        return;
      }

      if (!res.ok) {
        setResetError(data.message || "Failed to send reset link.");
        return;
      }

      setResetMessage("Password reset link has been sent to your email.");
      setResetEmail("");
    } catch (err) {
      console.error("[forgot-password] fetch failed", err);
      setResetError(
        `Cannot reach API at ${API_BASE}. Start the backend and check NEXT_PUBLIC_API_URL.`,
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className="loginPage"
      style={{
        minHeight: "100vh",
        backgroundColor: "#F1F5F9",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <header
        className="loginHeader"
        style={{
          height: "80px",
          backgroundColor: "#005696",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 60px",
          position: "relative",
        }}
      >
        <img
          src="/logo-white.svg"
          alt="Blue Giant Logo"
          style={{ height: 45 }}
        />

        {/* Desktop nav links — always visible on wide screens */}
        <div className="loginNavLinks" style={{ display: "flex", gap: "30px" }}>
          <a
            href="/contact"
            style={{ color: "#fff", textDecoration: "none", fontWeight: 600 }}
          >
            Contact Us
          </a>
          <a
            href="/support"
            style={{ color: "#fff", textDecoration: "none", fontWeight: 600 }}
          >
            Support
          </a>
        </div>

        {/* Mobile hamburger — hidden on desktop via CSS */}
        <button
          className="loginNavToggle"
          onClick={() => setNavMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          type="button"
          style={{
            display: "none",
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 24,
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: 8,
            lineHeight: 1,
          }}
        >
          {navMenuOpen ? "✕" : "☰"}
        </button>

        {/* Mobile dropdown — shown when navMenuOpen */}
        {navMenuOpen && (
          <div
            className="loginNavDropdown"
            style={{
              position: "absolute",
              top: "80px",
              right: 0,
              width: "100%",
              backgroundColor: "#004a82",
              display: "flex",
              flexDirection: "column",
              zIndex: 100,
            }}
          >
            <a
              href="/contact"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}
              onClick={() => setNavMenuOpen(false)}
            >
              Contact Us
            </a>
            <a
              href="/support"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                padding: "14px 20px",
              }}
              onClick={() => setNavMenuOpen(false)}
            >
              Support
            </a>
          </div>
        )}
      </header>

      <main
        className="loginMain"
        style={{
          height: "calc(100vh - 80px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "450px",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "50px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          }}
        >
          {!showForgot ? (
            <>
              <h1
                style={{
                  textAlign: "center",
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#005696",
                  marginBottom: "8px",
                }}
              >
                Welcome to Admin Portal!
              </h1>

              <p
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  color: "#475569",
                  marginBottom: "30px",
                }}
              >
                Enter your credentials to access the dashboard
              </p>

              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                Email Address
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "8px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  backgroundColor: "#FFFFFF",
                  color: "#0F172A",
                  outline: "none",
                }}
              />

              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                Password
              </label>

              <div style={{ position: "relative", marginTop: "8px" }}>
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    padding: "14px",
                    paddingRight: "45px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "14px",
                    backgroundColor: "#FFFFFF",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />

                <button
                  type="button"
                  onMouseEnter={() => setShow(true)}
                  onMouseLeave={() => setShow(false)}
                  style={{
                    color: "black",
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  👁
                </button>
              </div>

              {error && (
                <p
                  style={{
                    marginTop: "15px",
                    color: "#DC2626",
                    fontSize: "14px",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                onClick={handleLogin}
                style={{
                  width: "100%",
                  marginTop: "30px",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#005696",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Login
              </button>

              <div style={{ textAlign: "right", marginTop: "15px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setResetEmail(username);
                    setResetError("");
                    setResetMessage("");
                  }}
                  style={{
                    fontSize: "13px",
                    color: "#005696",
                    background: "none",
                    border: "none",
                    textDecoration: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            </>
          ) : (
            <>
              <h1
                style={{
                  textAlign: "center",
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#005696",
                  marginBottom: "8px",
                }}
              >
                Reset Password
              </h1>

              <p
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  color: "#475569",
                  marginBottom: "30px",
                }}
              >
                Enter your email address on which you will get a reset password
                link.
              </p>

              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                Email Address
              </label>

              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "8px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  backgroundColor: "#FFFFFF",
                  color: "#0F172A",
                  outline: "none",
                }}
              />

              {resetError && (
                <p
                  style={{
                    marginTop: "10px",
                    color: "#DC2626",
                    fontSize: "14px",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {resetError}
                </p>
              )}

              {resetMessage && (
                <p
                  style={{
                    marginTop: "10px",
                    color: "#15803D",
                    fontSize: "14px",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {resetMessage}
                </p>
              )}

              <button
                onClick={handleForgotPassword}
                disabled={resetLoading}
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#005696",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setResetError("");
                  setResetMessage("");
                }}
                style={{
                  width: "100%",
                  marginTop: "12px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  color: "#0F172A",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Back to Login
              </button>
            </>
          )}

          <hr
            style={{
              margin: "30px 0",
              border: "none",
              borderTop: "1px solid #E2E8F0",
            }}
          />

          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#64748B",
            }}
          >
            <footer className="footer responsiveFooter">
  © {new Date().getFullYear()} Blue Giant Equipment Corporation
</footer>
          </div>
        </div>
      </main>
    </div>
  );
}
