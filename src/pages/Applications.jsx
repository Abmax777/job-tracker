import { useState } from "react"
import { useApp } from "../context/AppContext"
import StatusBadge from "../components/StatusBadge"
import { formatDate, APPLICATION_STATUSES, SOURCES, CV_TYPES } from "../services/sheetsService"

const S = {
  card:    { background: "#161b22", border: "1px solid #21262d", borderRadius: "12px", padding: "20px" },
  input:   { background: "#0d0f14", border: "1px solid #21262d", borderRadius: "8px", color: "#e6edf3", width: "100%", padding: "8px 12px", fontSize: "13px", outline: "none" },
  select:  { background: "#0d0f14", border: "1px solid #21262d", borderRadius: "8px", color: "#e6edf3", width: "100%", padding: "8px 12px", fontSize: "13px", outline: "none" },
  label:   { color: "#8b949e", fontSize: "12px", fontWeight: "500", display: "block", marginBottom: "4px" },
  th:      { color: "#8b949e", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", padding: "12px 16px", textAlign: "left", background: "#0d0f14", borderBottom: "1px solid #21262d" },
  td:      { padding: "12px 16px", fontSize: "13px", color: "#e6edf3", borderBottom: "1px solid #21262d" },
  tdMuted: { padding: "12px 16px", fontSize: "13px", color: "#8b949e", borderBottom: "1px solid #21262d" },
  modal:   { background: "#161b22", border: "1px solid #21262d", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "24px" },
}

const EMPTY_FORM = {
  company: "", role: "", source: "LinkedIn",
  dateApplied: new Date().toISOString().split("T")[0],
  status: "Applied", cvUsed: "Specialist (AOSP)",
  salaryExpected: "", notes: ""
}

export default function Applications() {
  const { applications, addApplication, updateApplication, deleteApplication, loading } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterSource, setFilterSource] = useState("All")
  const [saving, setSaving] = useState(false)

  const filtered = applications.filter(app => {
    const statusMatch = filterStatus === "All" || app.Status === filterStatus
    const sourceMatch = filterSource === "All" || app.Source === filterSource
    return statusMatch && sourceMatch
  })

  function openAdd() { setForm(EMPTY_FORM); setEditing(null); setShowForm(true) }

  function openEdit(app) {
    setForm({
      company: app.Company, role: app.Role, source: app.Source,
      dateApplied: app["Date Applied"], status: app.Status,
      cvUsed: app["CV Used"], salaryExpected: app["Salary Expected"], notes: app.Notes
    })
    setEditing(app); setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); setForm(EMPTY_FORM) }

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true)
    if (editing) {
      await updateApplication(editing._rowIndex, {
        ID: editing.ID, Company: form.company, Role: form.role,
        Source: form.source, "Date Applied": form.dateApplied,
        Status: form.status, "CV Used": form.cvUsed,
        "Salary Expected": form.salaryExpected, Notes: form.notes
      })
    } else {
      await addApplication(form)
    }
    setSaving(false); closeForm()
  }

  async function handleDelete(app) {
    if (confirm(`Delete application for ${app.Company}?`)) {
      await deleteApplication(app._rowIndex)
    }
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
      <span style={{ color: "#8b949e", fontSize: "13px" }}>Loading...</span>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#e6edf3", margin: 0 }}>Applications</h1>
          <p style={{ color: "#8b949e", fontSize: "13px", marginTop: "4px" }}>
            {filtered.length} of {applications.length} shown
          </p>
        </div>
        <button onClick={openAdd} style={{
          background: "#2d6a9f", color: "#fff", padding: "8px 16px",
          borderRadius: "8px", fontSize: "13px", fontWeight: "600",
          cursor: "pointer", border: "none"
        }}>
          + Add Application
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px" }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...S.select, width: "auto" }}>
          <option value="All">All Statuses</option>
          {APPLICATION_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={{ ...S.select, width: "auto" }}>
          <option value="All">All Sources</option>
          {SOURCES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📋</div>
            <p style={{ color: "#e6edf3", fontWeight: "500", fontSize: "14px" }}>No applications yet</p>
            <p style={{ color: "#8b949e", fontSize: "13px", marginTop: "4px" }}>Click "Add Application" to get started</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Company", "Role", "Source", "Date", "Status", "CV Used", "Salary", "Actions"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, i) => (
                  <tr key={i} style={{ transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1c2128"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ ...S.td, fontWeight: "600" }}>{app.Company}</td>
                    <td style={S.tdMuted}>{app.Role}</td>
                    <td style={S.tdMuted}>{app.Source}</td>
                    <td style={S.tdMuted}>{formatDate(app["Date Applied"])}</td>
                    <td style={S.td}><StatusBadge status={app.Status} /></td>
                    <td style={S.tdMuted}>{app["CV Used"]}</td>
                    <td style={S.tdMuted}>{app["Salary Expected"] || "--"}</td>
                    <td style={{ ...S.td, display: "flex", gap: "8px" }}>
                      <button onClick={() => openEdit(app)} style={{ background: "none", border: "none", color: "#58a6ff", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>Edit</button>
                      <button onClick={() => handleDelete(app)} style={{ background: "none", border: "none", color: "#f85149", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={S.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#e6edf3", fontSize: "16px", fontWeight: "700", margin: 0 }}>
                {editing ? "Edit Application" : "Add Application"}
              </h2>
              <button onClick={closeForm} style={{ background: "none", border: "none", color: "#8b949e", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={S.label}>Company *</label>
                  <input required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={S.input} placeholder="e.g. Samsung SRINO" />
                </div>
                <div>
                  <label style={S.label}>Role *</label>
                  <input required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={S.input} placeholder="e.g. Android Platform Engineer" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={S.label}>Source</label>
                  <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={S.select}>
                    {SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Date Applied</label>
                  <input type="date" value={form.dateApplied} onChange={e => setForm({ ...form, dateApplied: e.target.value })} style={S.input} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={S.label}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={S.select}>
                    {APPLICATION_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>CV Used</label>
                  <select value={form.cvUsed} onChange={e => setForm({ ...form, cvUsed: e.target.value })} style={S.select}>
                    {CV_TYPES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={S.label}>Expected Salary (LPA)</label>
                <input value={form.salaryExpected} onChange={e => setForm({ ...form, salaryExpected: e.target.value })} style={S.input} placeholder="e.g. 25 LPA" />
              </div>

              <div>
                <label style={S.label}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...S.input, resize: "none" }} placeholder="Interview prep, contacts, links..." />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="button" onClick={closeForm} style={{ flex: 1, background: "transparent", border: "1px solid #21262d", color: "#8b949e", padding: "9px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, background: "#2d6a9f", color: "#fff", padding: "9px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "none", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Saving..." : editing ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}