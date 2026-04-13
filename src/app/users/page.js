"use client";

import { useEffect, useMemo, useState } from "react";
import "./users.css";
import "@/app/components/cards.css";
import "@/app/styles/responsive.css";
import AppShell from "../components/appNavHead";
import { API_BASE, getAuthHeaders } from "@/lib/apiBase";

function validatePassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

function ModalWrapper({ title, children, onClose }) {
  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div className="modalCard responsiveModalCard" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <p className="modalKicker">Blue Giant</p>
            <h2 className="modalTitleText">{title}</h2>
          </div>
          <button className="closeBtn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled = false }) {
  return (
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
    name: "", email: "", password: "", role_id: 2, is_active: true,
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email and password are required.");
      return;
    }

    if (existingUsers.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      setError("Email already exists.");
      return;
    }

    if (!validatePassword(form.password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase and a number.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to create user"); return; }
      onSuccess(); onClose();
    } catch { setError("Server error"); }
    finally { setLoading(false); }
  }

  return (
    <ModalWrapper title="Add User" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field label="Name"     value={form.name}     onChange={(e) => updateField("name",     e.target.value)} />
        <Field label="Email"    value={form.email}    onChange={(e) => updateField("email",    e.target.value)} />
        <Field label="Password" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} />
        <div className="twoCol responsiveTwoCol">
          <RoleStatusFields form={form} updateField={updateField} />
        </div>
        {error && <div className="formError">{error}</div>}
        <div className="modalActions">
          <button type="button" className="btnSecondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btnPrimary" disabled={loading}>
            {loading ? "Creating…" : "Create User"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

function EditUserModal({ user, onClose, onSuccess }) {
  const [form, setForm]       = useState({ role_id: user.role_id, is_active: user.is_active });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSave() {
    try {
      setLoading(true);
      const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
      const [roleRes, statusRes] = await Promise.all([
        fetch(`${API_BASE}/users/${user.user_id}/role`,   { method: "PUT", headers, body: JSON.stringify({ role_id:   form.role_id   }) }),
        fetch(`${API_BASE}/users/${user.user_id}/status`, { method: "PUT", headers, body: JSON.stringify({ is_active: form.is_active }) }),
      ]);
      if (!roleRes.ok || !statusRes.ok) { setError("Update failed"); return; }
      onSuccess(); onClose();
    } catch { setError("Server error"); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!confirm("Delete this user?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users/${user.user_id}`, {
        method: "DELETE", headers: { ...getAuthHeaders() },
      });
      if (!res.ok) { setError("Delete failed"); return; }
      onSuccess(); onClose();
    } catch { setError("Server error"); }
    finally { setLoading(false); }
  }

  return (
    <ModalWrapper title="Edit User" onClose={onClose}>
      <Field label="Name"  value={user.name}  disabled />
      <Field label="Email" value={user.email} disabled />
      <div className="twoCol responsiveTwoCol">
        <RoleStatusFields form={form} updateField={updateField} />
      </div>
      {error && <div className="formError">{error}</div>}
      <div className="modalActions between">
        <button className="btnDanger" type="button" onClick={handleDelete} disabled={loading}>
          {loading ? "Processing…" : "Delete"}
        </button>
        <div className="rightActions">
          <button className="btnSecondary" type="button" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btnPrimary"   type="button" onClick={handleSave} disabled={loading}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function UsersPage() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchUsers() {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE}/users`, { headers: { ...getAuthHeaders() } });
        const data = await res.json();
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      } catch { if (!cancelled) setUsers([]); }
      finally  { if (!cancelled) setLoading(false); }
    }
    fetchUsers();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const totalUsers  = users.length;
  const technicians = useMemo(() => users.filter((u) => u.role_id === 2).length, [users]);

  const getRoleLabel = (roleId) =>
    roleId === 1 ? "Admin" : roleId === 2 ? "Technician" : "User";

  return (
    <AppShell active="users">
      <div className="usersPage responsivePage">

        {/* ───── HERO (no button here) ───── */}
        <section className="userHero">
          <p className="userKicker">Access Control</p>
          <div className="userHeroTop">
            <div>
              <h1 className="userHeroTitle">User Management</h1>
              <p className="userHeroText">
                Manage technician access, assign platform roles, and control active user permissions across Blue Giant systems.
              </p>
            </div>
          </div>
          <div className="userHeroRail" />
        </section>

        <div className="responsiveStack">

          {/* ───── STAT CARDS — full width, 2 columns ───── */}
          <section className="userCards responsiveSection" aria-label="User statistics">
            <div className="userCard">
              <div className="userCardValue">{totalUsers}</div>
              <div className="userCardLabel">Total Users</div>
            </div>
            <div className="userCard">
              <div className="userCardValue">{technicians}</div>
              <div className="userCardLabel">Technicians</div>
            </div>
          </section>

          {/* ───── TABLE PANEL ───── */}
          <section className="panel responsivePanel responsiveSection">

            {/* Button lives HERE, right side of panel header */}
            <div className="panelHeader">
              <h2>Platform Users</h2>
              <button className="addUserBtn" onClick={() => setShowAdd(true)}>
                + Add User
              </button>
            </div>

            <div className="tableWrap">
              <table className="table">
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
                    <tr><td colSpan="5" className="tableMessage">Loading users…</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="5" className="tableMessage">No users found.</td></tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.user_id}>
                        <td data-label="Name"    className="strong">{u.name}</td>
                        <td data-label="Email"  >{u.email}</td>
                        <td data-label="Role"   >{getRoleLabel(u.role_id)}</td>
                        <td data-label="Status" >
                          <span className={u.is_active ? "pill success" : "pill failed"}>
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td data-label="Actions">
                          <button className="siteEditBtn" onClick={() => setEditUser(u)}>Edit</button>
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
