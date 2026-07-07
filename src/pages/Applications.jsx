import { useState, useEffect } from "react"
import { useIsMobile } from "../hooks/useIsMobile"
import { useApp } from "../context/AppContext"
import StatusBadge from "../components/StatusBadge"
import { formatDate, APPLICATION_STATUSES, SOURCES, CV_TYPES } from "../services/sheetsService"

const S = {
  card:    { background: "#1a1a1a", border: "1px solid #222", borderRadius: "12px", padding: "20px" },
  input:   { background: "#111", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#e0e0e0", width: "100%", padding: "8px 12px", fontSize: "13px", outline: "none" },
  select:  { background: "#111", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#e0e0e0", width: "100%", padding: "8px 12px", fontSize: "13px", outline: "none" },
  label:   { color: "#555", fontSize: "12px", fontWeight: "500", display: "block", marginBottom: "4px" },
  th:      { color: "#444", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px", textAlign: "left", background: "#111", borderBottom: "1px solid #1e1e1e" },
  td:      { padding: "12px 16px", fontSize: "13px", color: "#e0e0e0", borderBottom: "1px solid #1a1a1a" },
  tdMuted: { padding: "12px 16px", fontSize: "13px", color: "#555", borderBottom: "1px solid #1a1a1a" },
  modal:   { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "24px" },
}

const EMPTY_FORM = {
  company: "", role: "", source: "LinkedIn",
  dateApplied: new Date().toISOString().split("T")[0],
  status: "Applied", cvUsed: "Specialist (AOSP)",
  salaryExpected: "", notes: ""
}

export default function Applications() {
  const { applications, addApplication, updateApplication, deleteApplication, loading } = useApp()
  const isMobile = useIsMobile()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterSource, setFilterSource] = useState("All")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("date-desc")
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = applications.filter(app => {
  const statusMatch = filterStatus === "All" || app.Status === filterStatus
  const sourceMatch = filterSource === "All" || app.Source === filterSource
  const q = search.trim().toLowerCase()
  const searchMatch = !q ||
    (app.Company || "").toLowerCase().includes(q) ||
    (app.Role || "").toLowerCase().includes(q)
  return statusMatch && sourceMatch && searchMatch
})

const dateVal = app => {
  const d = new Date(app["Date Applied"])
  return isNaN(d) ? 0 : d.getTime()
}

const sorted = [...filtered].sort((a, b) => {
  switch (sortBy) {
    case "date-asc":   return dateVal(a) - dateVal(b)
    case "company-az": return (a.Company || "").localeCompare(b.Company || "")
    case "company-za": return (b.Company || "").localeCompare(a.Company || "")
    case "status":     return (a.Status || "").localeCompare(b.Status || "")
    default:           return dateVal(b) - dateVal(a)  // newest first
  }
})

  useEffect(() => {
    if (!showForm) return
    const handler = e => { if (e.key === "Escape") closeForm() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [showForm])

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
    await deleteApplication(app._rowIndex)
    setConfirmDelete(null)
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
      <span style={{ color: "#555", fontSize: "13px" }}>Loading...</span>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ paddingBottom: "20px", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: isMobile ? "center" : "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: isMobile ? "22px" : "30px", fontWeight: "800", color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>Applications</h1>
          <p style={{ color: "#555", fontSize: "13px", marginTop: "6px" }}>
            {filtered.length} of {applications.length} shown
          </p>
        </div>
        <button onClick={openAdd} style={{
          background: "#58a6ff", color: "#000", padding: "9px 18px",
          borderRadius: "8px", fontSize: "13px", fontWeight: "700",
          cursor: "pointer", border: "none", marginTop: "4px"
        }}>
          + Add Application
        </button>
      </div>

      {/* Unified filter bar */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          style={{ ...S.input, maxWidth: "220px" }}
          placeholder="Search company or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...S.select, width: "auto" }}>
          <option value="All">All Statuses</option>
          {APPLICATION_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={{ ...S.select, width: "auto" }}>
          <option value="All">All Sources</option>
          {SOURCES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...S.select, width: "auto" }}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="company-az">Company A–Z</option>
          <option value="company-za">Company Z–A</option>
          <option value="status">Status</option>
        </select>
        {(search || filterStatus !== "All" || filterSource !== "All") && (
          <button
            onClick={() => { setSearch(""); setFilterStatus("All"); setFilterSource("All") }}
            style={{ background: "transparent", border: "1px solid #21262d", color: "#8b949e", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", cursor: "pointer" }}
          >
            Clear
          </button>
        )}
        <span style={{ color: "#8b949e", fontSize: "12px", marginLeft: "auto" }}>
          {sorted.length} of {applications.length}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📋</div>
            <p style={{ color: "#e0e0e0", fontWeight: "600", fontSize: "14px" }}>No applications yet</p>
            <p style={{ color: "#555", fontSize: "13px", marginTop: "4px" }}>Click "Add Application" to get started</p>
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
                {sorted.map((app, i) => (
                  <tr key={i}
                    onClick={() => openEdit(app)}
                    onMouseEnter={e => e.currentTarget.style.background = "#1e1e1e"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ transition: "background 0.15s", cursor: "pointer" }}
                  >
                    <td style={{ ...S.td, fontWeight: "600" }}>{app.Company}</td>
                    <td style={S.tdMuted}>{app.Role}</td>
                    <td style={S.tdMuted}>{app.Source}</td>
                    <td style={S.tdMuted}>{formatDate(app["Date Applied"])}</td>
                    <td style={S.td}><StatusBadge status={app.Status} /></td>
                    <td style={S.tdMuted}>{app["CV Used"]}</td>
                    <td style={S.tdMuted}>{app["Salary Expected"] || "--"}</td>
                    <td style={{ ...S.td }} onClick={e => e.stopPropagation()}>
                      {confirmDelete === app._rowIndex ? (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", color: "#888" }}>Sure?</span>
                          <button onClick={() => handleDelete(app)} style={{ background: "none", border: "none", color: "#f85149", fontSize: "12px", cursor: "pointer", fontWeight: "700" }}>Yes</button>
                          <button onClick={() => setConfirmDelete(null)} style={{ background: "none", border: "none", color: "#555", fontSize: "12px", cursor: "pointer" }}>No</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "12px" }}>
                          <button onClick={() => openEdit(app)} style={{ background: "none", border: "none", color: "#58a6ff", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>Edit</button>
                          <button onClick={() => setConfirmDelete(app._rowIndex)} style={{ background: "none", border: "none", color: "#f85149", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>Delete</button>
                        </div>
                      )}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={S.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", margin: 0 }}>
                {editing ? "Edit Application" : "Add Application"}
              </h2>
              <button onClick={closeForm} style={{ background: "none", border: "none", color: "#555", fontSize: "20px", cursor: "pointer", lineHeight: 1 }}>✕</button>
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
                <button type="button" onClick={closeForm} style={{ flex: 1, background: "transparent", border: "1px solid #2a2a2a", color: "#666", padding: "9px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, background: "#58a6ff", color: "#000", padding: "9px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", border: "none", opacity: saving ? 0.6 : 1 }}>
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