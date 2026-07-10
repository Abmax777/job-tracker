import { useState, useEffect } from "react"
import { useIsMobile } from "../hooks/useIsMobile"
import { useApp } from "../context/AppContext"
import StatusBadge from "../components/StatusBadge"
import { formatDate, INTERVIEW_TYPES } from "../services/sheetsService"

const GLASS = "rgba(255,255,255,0.04)"
const GLASS_BORDER = "1px solid rgba(255,255,255,0.09)"
const S = {
  card:    { background: GLASS, backdropFilter: "blur(22px) saturate(160%)", WebkitBackdropFilter: "blur(22px) saturate(160%)", border: GLASS_BORDER, borderRadius: "12px", padding: "20px", boxShadow: "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)" },
  input:   { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e0e0e0", width: "100%", padding: "8px 12px", fontSize: "13px", outline: "none" },
  select:  { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e0e0e0", width: "100%", padding: "8px 12px", fontSize: "13px", outline: "none" },
  label:   { color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: "500", display: "block", marginBottom: "4px" },
  th:      { color: "rgba(255,255,255,0.25)", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px", textAlign: "left", background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  td:      { padding: "12px 16px", fontSize: "13px", color: "#e0e0e0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  tdMuted: { padding: "12px 16px", fontSize: "13px", color: "rgba(255,255,255,0.38)", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  modal:   { background: "rgba(10,10,28,0.82)", backdropFilter: "blur(40px) saturate(160%)", WebkitBackdropFilter: "blur(40px) saturate(160%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" },
}

const OUTCOMES = ["Pending", "Passed", "Failed", "Cancelled", "Rescheduled"]

const EMPTY_FORM = {
  company: "", round: "1", type: "Technical Round",
  date: new Date().toISOString().split("T")[0],
  time: "", meetingLink: "",
  outcome: "Pending", notes: ""
}

export default function Interviews() {
  const { interviews, applications, addInterview, updateInterview, deleteInterview, loading } = useApp()
  const isMobile = useIsMobile()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [filterOutcome, setFilterOutcome] = useState("All")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("date-desc")
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const companies = [...new Set(applications.map(a => a.Company))].sort()

  const filtered = interviews.filter(i => {
    const outcomeMatch = filterOutcome === "All" || i.Outcome === filterOutcome
    const q = search.trim().toLowerCase()
    const searchMatch = !q || (i.Company || "").toLowerCase().includes(q) || (i.Type || "").toLowerCase().includes(q)
    return outcomeMatch && searchMatch
  })

  const dateVal = i => { const d = new Date(i.Date); return isNaN(d) ? 0 : d.getTime() }
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date-asc") return dateVal(a) - dateVal(b)
    if (sortBy === "company-az") return (a.Company || "").localeCompare(b.Company || "")
    return dateVal(b) - dateVal(a)
  })

  const upcoming = interviews
    .filter(i => new Date(i.Date) >= new Date() && i.Outcome === "Pending")
    .sort((a, b) => new Date(a.Date) - new Date(b.Date))

  useEffect(() => {
    if (!showForm) return
    const handler = e => { if (e.key === "Escape") closeForm() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [showForm])

  function openAdd() { setForm(EMPTY_FORM); setEditing(null); setShowForm(true) }

  function openEdit(interview) {
    setForm({
      company: interview.Company, round: interview.Round,
      type: interview.Type, date: interview.Date,
      time: interview.Time || "", meetingLink: interview["Meeting Link"] || "",
      outcome: interview.Outcome, notes: interview.Notes
    })
    setEditing(interview); setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); setForm(EMPTY_FORM) }

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true)
    if (editing) {
      await updateInterview(editing._rowIndex, {
        ID: editing.ID, Company: form.company, Round: form.round,
        Type: form.type, Date: form.date, Outcome: form.outcome, Notes: form.notes,
        Time: form.time, "Meeting Link": form.meetingLink
      })
    } else {
      await addInterview(form)
    }
    setSaving(false); closeForm()
  }

  async function handleDelete(interview) {
    await deleteInterview(interview._rowIndex)
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
      <div style={{ paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: isMobile ? "center" : "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: isMobile ? "22px" : "30px", fontWeight: "800", color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>Interviews</h1>
          <p style={{ color: "#555", fontSize: "13px", marginTop: "6px" }}>
            {interviews.length} total · {upcoming.length} upcoming
          </p>
        </div>
        <button onClick={openAdd} style={{
          background: "#58a6ff", color: "#000", padding: "9px 18px",
          borderRadius: "8px", fontSize: "13px", fontWeight: "700",
          cursor: "pointer", border: "none", marginTop: "4px"
        }}>
          + Log Interview
        </button>
      </div>

      {/* Upcoming banner */}
      {upcoming.length > 0 && (
        <div style={{ background: "rgba(63,185,80,0.06)", border: "1px solid rgba(63,185,80,0.2)", borderRadius: "12px", padding: "16px" }}>
          <p style={{ color: "#3fb950", fontWeight: "600", fontSize: "12px", letterSpacing: "0.06em", marginBottom: "12px" }}>
            UPCOMING INTERVIEWS
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {upcoming.map((interview, i) => {
              const daysUntil = Math.ceil((new Date(interview.Date) - new Date()) / (1000 * 60 * 60 * 24))
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ color: "#e0e0e0", fontWeight: "600", fontSize: "13px", margin: 0 }}>{interview.Company}</p>
                    <p style={{ color: "#555", fontSize: "11px", marginTop: "2px" }}>Round {interview.Round} · {interview.Type}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "#3fb950", fontSize: "13px", fontWeight: "600", margin: 0 }}>
                      {formatDate(interview.Date)}{interview.Time ? ` · ${interview.Time}` : ""}
                    </p>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
                      <span style={{ color: "#555", fontSize: "11px" }}>
                        {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                      </span>
                      {interview["Meeting Link"] && (
                        <a href={interview["Meeting Link"]} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ color: "#58a6ff", fontSize: "11px", fontWeight: "600", textDecoration: "none" }}>
                          Join ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {[
          { label: "Total",    value: interviews.length,                                     color: "#e0e0e0" },
          { label: "Upcoming", value: upcoming.length,                                       color: "#58a6ff" },
          { label: "Passed",   value: interviews.filter(i => i.Outcome === "Passed").length, color: "#3fb950" },
          { label: "Failed",   value: interviews.filter(i => i.Outcome === "Failed").length, color: "#f85149" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...S.card, padding: "18px 20px" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color, letterSpacing: "-0.5px" }}>{value}</div>
            <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <input style={{ ...S.input, maxWidth: "220px" }} placeholder="Search company or type…" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)} style={{ ...S.select, width: "auto" }}>
          <option value="All">All Outcomes</option>
          {OUTCOMES.map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...S.select, width: "auto" }}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="company-az">Company A–Z</option>
        </select>
        {(search || filterOutcome !== "All") && (
          <button onClick={() => { setSearch(""); setFilterOutcome("All") }} style={{ background: "transparent", border: "1px solid #21262d", color: "#8b949e", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", cursor: "pointer" }}>Clear</button>
        )}
        <span style={{ color: "#8b949e", fontSize: "12px", marginLeft: "auto" }}>{sorted.length} of {interviews.length}</span>
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(22px) saturate(160%)", WebkitBackdropFilter: "blur(22px) saturate(160%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 32px rgba(0,0,0,0.4)" }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎯</div>
            <p style={{ color: "#e0e0e0", fontWeight: "600", fontSize: "14px" }}>No interviews logged yet</p>
            <p style={{ color: "#555", fontSize: "13px", marginTop: "4px" }}>They'll come — keep applying!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Company", "Round", "Type", "Date & Time", "Outcome", "Link", "Actions"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((interview, i) => (
                  <tr key={i}
                    onClick={() => openEdit(interview)}
                    style={{ transition: "background 0.15s", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ ...S.td, fontWeight: "600" }}>{interview.Company}</td>
                    <td style={S.tdMuted}>Round {interview.Round}</td>
                    <td style={S.tdMuted}>{interview.Type}</td>
                    <td style={S.tdMuted}>
                      <div>{formatDate(interview.Date)}</div>
                      {interview.Time && <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>{interview.Time}</div>}
                    </td>
                    <td style={S.td}><StatusBadge status={interview.Outcome} /></td>
                    <td style={S.td} onClick={e => e.stopPropagation()}>
                      {interview["Meeting Link"]
                        ? <a href={interview["Meeting Link"]} target="_blank" rel="noopener noreferrer"
                            style={{ color: "#58a6ff", fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>Join ↗</a>
                        : <span style={{ color: "#333", fontSize: "12px" }}>--</span>
                      }
                    </td>
                    <td style={S.td} onClick={e => e.stopPropagation()}>
                      {confirmDelete === interview._rowIndex ? (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", color: "#888" }}>Sure?</span>
                          <button onClick={() => handleDelete(interview)} style={{ background: "none", border: "none", color: "#f85149", fontSize: "12px", cursor: "pointer", fontWeight: "700" }}>Yes</button>
                          <button onClick={() => setConfirmDelete(null)} style={{ background: "none", border: "none", color: "#555", fontSize: "12px", cursor: "pointer" }}>No</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "12px" }}>
                          <button onClick={() => openEdit(interview)} style={{ background: "none", border: "none", color: "#58a6ff", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>Edit</button>
                          <button onClick={() => setConfirmDelete(interview._rowIndex)} style={{ background: "none", border: "none", color: "#f85149", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>Delete</button>
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
                {editing ? "Edit Interview" : "Log Interview"}
              </h2>
              <button onClick={closeForm} style={{ background: "none", border: "none", color: "#555", fontSize: "20px", cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={S.label}>Company *</label>
                {companies.length > 0 ? (
                  <select required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={S.select}>
                    <option value="">Select company</option>
                    {companies.map(c => <option key={c}>{c}</option>)}
                  </select>
                ) : (
                  <input required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={S.input} placeholder="e.g. Samsung SRINO" />
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={S.label}>Round</label>
                  <select value={form.round} onChange={e => setForm({ ...form, round: e.target.value })} style={S.select}>
                    {["1","2","3","4","5"].map(r => <option key={r} value={r}>Round {r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={S.select}>
                    {INTERVIEW_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={S.label}>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Time</label>
                  <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={S.input} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={S.label}>Outcome</label>
                  <select value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })} style={S.select}>
                    {OUTCOMES.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Meeting Link</label>
                  <input value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })} style={S.input} placeholder="https://meet.google.com/..." />
                </div>
              </div>

              <div>
                <label style={S.label}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...S.input, resize: "none" }} placeholder="Questions asked, feedback, prep notes..." />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="button" onClick={closeForm} style={{ flex: 1, background: "transparent", border: "1px solid #2a2a2a", color: "#666", padding: "9px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, background: "#58a6ff", color: "#000", padding: "9px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", border: "none", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Saving..." : editing ? "Update" : "Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}