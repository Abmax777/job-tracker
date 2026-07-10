import { useState, useEffect } from "react"
import { useIsMobile } from "../hooks/useIsMobile"
import { useApp } from "../context/AppContext"
import StatusBadge from "../components/StatusBadge"
import { formatDate, APPLICATION_STATUSES, SOURCES, CV_TYPES } from "../services/sheetsService"

/* ── Inject flip-card CSS once ─────────────────────────────────── */
const FLIP_CSS = `
  .app-flip-card { perspective: 1000px; }
  .app-flip-inner {
    position: relative; width: 100%; height: 100%;
    transition: transform 0.52s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
  }
  .app-flip-card:hover .app-flip-inner { transform: rotateY(180deg); }
  .app-flip-front, .app-flip-back {
    position: absolute; inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 12px;
    overflow: hidden;
  }
  .app-flip-front {
    background: #1a1a1a;
    border: 1px solid #222;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 10px;
    transition: border-color 0.2s;
  }
  .app-flip-card:hover .app-flip-front { border-color: #333; }
  .app-flip-back {
    background: #161b22;
    border: 1px solid #30363d;
    transform: rotateY(180deg);
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 14px;
  }
`

/* ── Helpers ───────────────────────────────────────────────────── */
const STATUS_COLORS = {
  Applied:            { bg: "rgba(88,166,255,0.12)",  color: "#58a6ff"  },
  "In Review":        { bg: "rgba(245,166,35,0.12)",  color: "#f5a623"  },
  "Interview Scheduled": { bg: "rgba(188,140,255,0.12)", color: "#bc8cff" },
  Rejected:           { bg: "rgba(248,81,73,0.12)",   color: "#f85149"  },
  Offer:              { bg: "rgba(63,185,80,0.12)",   color: "#3fb950"  },
}

function avatarColor(name = "") {
  const colors = ["#58a6ff","#3fb950","#f5a623","#bc8cff","#f85149","#79c0ff","#56d364","#ffa657"]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function guessDomain(company = "") {
  return company.toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\b(private|pvt|limited|ltd|llc|inc|corp|corporation|co|group|systems|technologies|technology|solutions|services|india|global|software|labs|ventures)\b\.?/gi, " ")
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

function CompanyLogo({ company }) {
  const [failed, setFailed] = useState(false)
  const initials = (company || "?").split(/[\s\-_]+/).map(w => w[0]).join("").slice(0, 2).toUpperCase()
  const color = avatarColor(company)
  const domain = guessDomain(company)

  if (failed || !domain) {
    return (
      <div style={{
        width: 44, height: 44, borderRadius: "10px",
        background: `${color}18`, border: `1.5px solid ${color}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "15px", fontWeight: "800", color, flexShrink: 0,
        letterSpacing: "-0.5px",
      }}>
        {initials}
      </div>
    )
  }

  return (
    <div style={{
      width: 44, height: 44, borderRadius: "10px",
      background: "#1e1e1e",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", flexShrink: 0,
      border: "1px solid #2a2a2a",
    }}>
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}.com&sz=64`}
        alt={company}
        onError={() => setFailed(true)}
        style={{ width: 28, height: 28, objectFit: "contain", imageRendering: "auto" }}
      />
    </div>
  )
}

/* ── Styles ────────────────────────────────────────────────────── */
const S = {
  input:  { background: "#111", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#e0e0e0", width: "100%", padding: "8px 12px", fontSize: "13px", outline: "none" },
  select: { background: "#111", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#e0e0e0", width: "100%", padding: "8px 12px", fontSize: "13px", outline: "none" },
  label:  { color: "#555", fontSize: "12px", fontWeight: "500", display: "block", marginBottom: "4px" },
  modal:  { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "24px" },
}

const EMPTY_FORM = {
  company: "", role: "", source: "LinkedIn",
  dateApplied: new Date().toISOString().split("T")[0],
  status: "Applied", cvUsed: "Specialist (AOSP)",
  salaryExpected: "", notes: ""
}

/* ── Main component ────────────────────────────────────────────── */
export default function Applications() {
  const { applications, addApplication, updateApplication, deleteApplication, loading } = useApp()
  const isMobile = useIsMobile()
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [editing, setEditing]         = useState(null)
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterSource, setFilterSource] = useState("All")
  const [search, setSearch]           = useState("")
  const [sortBy, setSortBy]           = useState("date-desc")
  const [saving, setSaving]           = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  /* filter + sort */
  const filtered = applications.filter(app => {
    const statusMatch = filterStatus === "All" || app.Status === filterStatus
    const sourceMatch = filterSource === "All" || app.Source === filterSource
    const q = search.trim().toLowerCase()
    const searchMatch = !q ||
      (app.Company || "").toLowerCase().includes(q) ||
      (app.Role || "").toLowerCase().includes(q)
    return statusMatch && sourceMatch && searchMatch
  })

  const dateVal = app => { const d = new Date(app["Date Applied"]); return isNaN(d) ? 0 : d.getTime() }

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "date-asc":   return dateVal(a) - dateVal(b)
      case "company-az": return (a.Company || "").localeCompare(b.Company || "")
      case "company-za": return (b.Company || "").localeCompare(a.Company || "")
      case "status":     return (a.Status || "").localeCompare(b.Status || "")
      default:           return dateVal(b) - dateVal(a)
    }
  })

  useEffect(() => {
    if (!showForm) return
    const handler = e => { if (e.key === "Escape") closeForm() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [showForm])

  function openAdd()  { setForm(EMPTY_FORM); setEditing(null); setShowForm(true) }
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

  const CARD_H = isMobile ? 148 : 160

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Inject flip CSS */}
      <style>{FLIP_CSS}</style>

      {/* Header */}
      <div style={{ paddingBottom: "20px", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: isMobile ? "center" : "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: isMobile ? "22px" : "30px", fontWeight: "800", color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>Applications</h1>
          <p style={{ color: "#555", fontSize: "13px", marginTop: "6px" }}>
            {sorted.length} of {applications.length} shown · hover a card to see details
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

      {/* Filter bar */}
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

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#1a1a1a", borderRadius: "12px", border: "1px solid #222" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>📋</div>
          <p style={{ color: "#e0e0e0", fontWeight: "600", fontSize: "14px" }}>No applications found</p>
          <p style={{ color: "#555", fontSize: "13px", marginTop: "4px" }}>Try adjusting your filters or add a new application</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(170px, 1fr))",
          gap: isMobile ? "10px" : "12px",
        }}>
          {sorted.map((app, i) => {
            const sc = STATUS_COLORS[app.Status] || STATUS_COLORS["Applied"]
            const isConfirming = confirmDelete === app._rowIndex

            return (
              <div
                key={i}
                className="app-flip-card"
                style={{ height: CARD_H }}
              >
                <div className="app-flip-inner">

                  {/* ── Front ─────────────────────────────── */}
                  <div className="app-flip-front">
                    <CompanyLogo company={app.Company} />
                    <div style={{ textAlign: "center", width: "100%", padding: "0 8px" }}>
                      <div style={{
                        fontSize: "13px", fontWeight: "700", color: "#e0e0e0",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        marginBottom: "6px",
                      }}>
                        {app.Company || "—"}
                      </div>
                      <span style={{
                        fontSize: "10px", fontWeight: "700", padding: "3px 9px",
                        borderRadius: "999px", background: sc.bg, color: sc.color,
                        letterSpacing: "0.03em",
                      }}>
                        {app.Status}
                      </span>
                    </div>
                  </div>

                  {/* ── Back ──────────────────────────────── */}
                  <div className="app-flip-back">
                    {/* Role */}
                    <div>
                      <div style={{ fontSize: "11px", color: "#555", fontWeight: "600", letterSpacing: "0.05em", marginBottom: "3px" }}>ROLE</div>
                      <div style={{
                        fontSize: "12px", color: "#e0e0e0", fontWeight: "600",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        overflow: "hidden", lineHeight: "1.4",
                      }}>
                        {app.Role || "—"}
                      </div>
                    </div>

                    {/* Meta grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 10px", margin: "8px 0" }}>
                      <div>
                        <div style={{ fontSize: "10px", color: "#444", marginBottom: "2px" }}>DATE</div>
                        <div style={{ fontSize: "11px", color: "#888" }}>{formatDate(app["Date Applied"])}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "10px", color: "#444", marginBottom: "2px" }}>SOURCE</div>
                        <div style={{ fontSize: "11px", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{app.Source || "—"}</div>
                      </div>
                      {app["CV Used"] && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <div style={{ fontSize: "10px", color: "#444", marginBottom: "2px" }}>CV</div>
                          <div style={{ fontSize: "11px", color: "#888" }}>{app["CV Used"]}</div>
                        </div>
                      )}
                      {app["Salary Expected"] && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <div style={{ fontSize: "10px", color: "#444", marginBottom: "2px" }}>SALARY</div>
                          <div style={{ fontSize: "11px", color: "#3fb950" }}>{app["Salary Expected"]}</div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ borderTop: "1px solid #21262d", paddingTop: "8px" }}>
                      {isConfirming ? (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", color: "#888", flex: 1 }}>Delete?</span>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(app) }}
                            style={{ background: "none", border: "none", color: "#f85149", fontSize: "12px", cursor: "pointer", fontWeight: "700", padding: "2px 4px" }}
                          >Yes</button>
                          <button
                            onClick={e => { e.stopPropagation(); setConfirmDelete(null) }}
                            style={{ background: "none", border: "none", color: "#555", fontSize: "12px", cursor: "pointer", padding: "2px 4px" }}
                          >No</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={e => { e.stopPropagation(); openEdit(app) }}
                            style={{ flex: 1, background: "rgba(88,166,255,0.1)", border: "none", color: "#58a6ff", fontSize: "11px", cursor: "pointer", fontWeight: "700", borderRadius: "6px", padding: "5px 0" }}
                          >Edit</button>
                          <button
                            onClick={e => { e.stopPropagation(); setConfirmDelete(app._rowIndex) }}
                            style={{ flex: 1, background: "rgba(248,81,73,0.1)", border: "none", color: "#f85149", fontSize: "11px", cursor: "pointer", fontWeight: "700", borderRadius: "6px", padding: "5px 0" }}
                          >Delete</button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}

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
