"use client";

import { useEffect, useMemo, useState } from "react";
import "./users.css";
import "@/app/components/cards.css";
import "@/app/styles/responsive.css";
import AppShell from "../components/appNavHead";
import { API_BASE, getAuthHeaders } from "@/lib/apiBase";

function MonoIcon({ children, className = "userGlyph" }) {
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

function validatePassword(password) {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return minLength && hasUpper && hasLower && hasNumber;
}

function ModalWrapper({ title, children, onClose }) {
  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div
        className="modalCard responsiveModalCard"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <h2 className="modalTitleText">{title}</h2>
          <button className="closeBtn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange, disabled = false }) {
  const isEmail = label === "Email";
  const isPassword = label === "Password";

  return (
    <div className="fieldRow">
      <div className="fieldIcon">
        {isEmail ? (
          <MonoIcon>
            <path d="M4 6h16v12H4z" />
            <path d="M4 8l8 6 8-6" />
          </MonoIcon>
        ) : isPassword ? (
          <MonoIcon>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </MonoIcon>
        ) : (
          <MonoIcon>
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" />
          </MonoIcon>
        )}
      </div>
      <div className="field">
        <label className="label">{label}</label>
        <input
          className="input"
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function RoleStatusFields({ form, updateField }) {
  return (
    <>
      <div className="field">
        <label className="label">Role</label>
        <select
          className="select"
          value={form.role_id}
          onChange={(e) => updateField("role_id", Number(e.target.value))}
        >
          <option value={1}>Admin</option>
          <option value={2}>Technician</option>
          <option value={3}>User</option>
        </select>
      </div>

      <div className="field">
        <label className="label">Status</label>
        <select
          className="select"
          value={form.is_active ? "active" : "inactive"}
          onChange={(e) => updateField("is_active", e.target.value === "active")}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </>
  );
}

function AddUserModal({ onClose, onSuccess, existingUsers }) {
  const [form, setForm] = useState({
    // user_id: "",
    name: "",
    email: "",
    password: "",
    role_id: 2,
    is_active: true,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (
      // !form.user_id.trim() ||
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      setError("User ID, name, email, and password are required.");
      return;
    }

    const emailExists = existingUsers.some(
      (u) => u.email.toLowerCase() === form.email.toLowerCase()
    );

    if (emailExists) {
      setError("Email already exists.");
      return;
    }

    if (!validatePassword(form.password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, and a number."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create user");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalWrapper title="Add User" onClose={onClose}>
      <form onSubmit={handleSubmit} autoComplete="off">
        {/* <Input
          label="User ID"
          value={form.user_id}
          onChange={(e) => updateField("user_id", e.target.value)}
        /> */}

        <Input
          label="Name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
        />

        <Input
          label="Email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
        />

        <div className="twoCol responsiveTwoCol">
          <RoleStatusFields form={form} updateField={updateField} />
        </div>

        {error && <div className="formError">{error}</div>}

        <div className="modalActions">
          <button
            type="button"
            className="btnSecondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button type="submit" className="btnPrimary" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

function EditUserModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    role_id: user.role_id,
    is_active: user.is_active,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setError("");

    try {
      setLoading(true);

      const commonHeaders = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };

      const roleRes = await fetch(`${API_BASE}/users/${user.user_id}/role`, {
        method: "PUT",
        headers: commonHeaders,
        body: JSON.stringify({ role_id: form.role_id }),
      });

      const statusRes = await fetch(`${API_BASE}/users/${user.user_id}/status`, {
        method: "PUT",
        headers: commonHeaders,
        body: JSON.stringify({ is_active: form.is_active }),
      });

      if (!roleRes.ok || !statusRes.ok) {
        setError("Update failed");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setError("");
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/users/${user.user_id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });

      if (!res.ok) {
        setError("Delete failed");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalWrapper title="Edit User" onClose={onClose}>
      <Input label="Name" value={user.name} disabled />
      <Input label="Email" value={user.email} disabled />

      <div className="twoCol responsiveTwoCol">
        <RoleStatusFields form={form} updateField={updateField} />
      </div>

      {error && <div className="formError">{error}</div>}

      <div className="modalActions between">
        <button
          className="btnDanger"
          type="button"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Processing..." : "Delete"}
        </button>

        <div className="rightActions">
          <button
            className="btnSecondary"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btnPrimary"
            type="button"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      try {
        const res = await fetch(`${API_BASE}/users`, {
          headers: { ...getAuthHeaders() },
        });

        const data = await res.json();

        if (!cancelled) {
          setUsers(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const totalUsers = users.length;
  const technicians = useMemo(
    () => users.filter((u) => u.role_id === 2).length,
    [users]
  );

  function getRoleLabel(role_id) {
    if (role_id === 1) return "Admin";
    if (role_id === 2) return "Technician";
    return "User";
  }

  function getStatusClass(is_active) {
    return is_active ? "pill success" : "pill failed";
  }

  function getStatusLabel(is_active) {
    return is_active ? "Active" : "Inactive";
  }

  return (
    <AppShell active="users">
      <div className="usersPage responsivePage">
        <div className="usersHeader responsiveHeader">
          <div>
            <h1 className="pageTitle">
              <span className="pageTitleIcon">
                <MonoIcon className="pageTitleGlyph">
                  <circle cx="9" cy="8" r="2.8" />
                  <circle cx="16.5" cy="9.5" r="2.2" />
                  <path d="M4.5 19c0-3 2.3-5 5.5-5s5.5 2 5.5 5" />
                  <path d="M14 19c.1-1.9 1.4-3.4 3.5-3.9" />
                </MonoIcon>
              </span>
              User Management
            </h1>
            <p className="subtitle responsiveSubtitle">
              Manage technician access across the platform.
            </p>
          </div>
        </div>

        <div className="responsiveStack">
          <section className="cards twoCol responsiveCards responsiveSection">
            <div className="card">
              <div className="cardIcon">
                <MonoIcon>
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" />
                </MonoIcon>
              </div>
              <div className="cardContent">
                <div className="cardValue">{totalUsers}</div>
                <div className="cardLabel">Total Users</div>
              </div>
            </div>

            <div className="card">
              <div className="cardIcon">
                <MonoIcon>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1 1 0 00.2 1.1l.1.1a1 1 0 010 1.4l-1.3 1.3a1 1 0 01-1.4 0l-.1-.1a1 1 0 00-1.1-.2 1 1 0 00-.6.9V20a1 1 0 01-1 1h-1.8a1 1 0 01-1-1v-.2a1 1 0 00-.6-.9 1 1 0 00-1.1.2l-.1.1a1 1 0 01-1.4 0L4.9 18a1 1 0 010-1.4l.1-.1a1 1 0 00.2-1.1 1 1 0 00-.9-.6H4a1 1 0 01-1-1V12a1 1 0 011-1h.2a1 1 0 00.9-.6 1 1 0 00-.2-1.1l-.1-.1a1 1 0 010-1.4L6.1 6a1 1 0 011.4 0l.1.1a1 1 0 001.1.2 1 1 0 00.6-.9V5a1 1 0 011-1h1.8a1 1 0 011 1v.2a1 1 0 00.6.9 1 1 0 001.1-.2l.1-.1a1 1 0 011.4 0l1.3 1.3a1 1 0 010 1.4l-.1.1a1 1 0 00-.2 1.1 1 1 0 00.9.6h.2a1 1 0 011 1v1.8a1 1 0 01-1 1h-.2a1 1 0 00-.9.6z" />
                </MonoIcon>
              </div>
              <div className="cardContent">
                <div className="cardValue">{technicians}</div>
                <div className="cardLabel">Total Technicians</div>
              </div>
            </div>
          </section>

          <section className="panel responsivePanel responsiveSection">
            <div className="panelHeader">
              <h2>Users</h2>
              <div className="panelHeaderActions responsiveActions">
                <button className="topEditBtn" onClick={() => setShowAdd(true)}>
                  Add User
                </button>
              </div>
            </div>

            <div className="tableWrap responsiveTableWrap">
              <table className="table responsiveTable">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.user_id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{getRoleLabel(u.role_id)}</td>
                        <td>
                          <span className={getStatusClass(u.is_active)}>
                            {getStatusLabel(u.is_active)}
                          </span>
                        </td>
                        <td>
                          <button className="editBtn" onClick={() => setEditUser(u)}>
                            Edit
                          </button>
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

        {showAdd && (
          <AddUserModal
            onClose={() => setShowAdd(false)}
            onSuccess={() => setRefreshKey((k) => k + 1)}
            existingUsers={users}
          />
        )}

        {editUser && (
          <EditUserModal
            user={editUser}
            onClose={() => setEditUser(null)}
            onSuccess={() => setRefreshKey((k) => k + 1)}
          />
        )}
      </div>
    </AppShell>
  );
}