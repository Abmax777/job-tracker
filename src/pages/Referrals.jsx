import { useState, useEffect } from "react"
import { useIsMobile } from "../hooks/useIsMobile"
import { useApp } from "../context/AppContext"
import StatusBadge from "../components/StatusBadge"
import { formatDate, REFERRAL_RESPONSES, SOURCES } from "../services/sheetsService"

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
  company: "", personName: "", personRole: "",
  platform: "LinkedIn", response: "Pending",
  referralGiven: "No", notes: ""
}

export default function Referrals() {
  const { referrals, addReferral, updateReferral, deleteReferral, loading } = useApp()
  const isMobile = useIsMobile()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [filterResponse, setFilterResponse] = useState("All")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("date-desc")
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = referrals.filter(r => {
    const responseMatch = filterResponse === "All" || r.Response === filterResponse
    const q = search.trim().toLowerCase()
    const searchMatch = !q || (r.Company || "").toLowerCase().includes(q) || (r["Person Name"] || "").toLowerCase().includes(q)
    return responseMatch && searchMatch
  })

  const dateVal = r => { const d = new Date(r["Date Sent"]); return isNaN(d) ? 0 : d.getTime() }
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date-asc") return dateVal(a) - dateVal(b)
    if (sortBy === "company-az") return (a.Company || "").localeCompare(b.Company || "")
    return dateVal(b) - dateVal(a)
  })

  const today = new Date().toISOString().split("T")[0]
  const todayCount = referrals.filter(r => r["Date Sent"] === today).length
  const goalPct = Math.min((todayCount / 3) * 100, 100)

  useEffect(() => {
    if (!showForm) return
    const handler = e => { if (e.key === "Escape") closeForm() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [showForm])

  function openAdd() { setForm(EMPTY_FORM); setEditing(null); setShowForm(true) }

  function openEdit(ref) {
    setForm({
      company: ref.Company, personName: ref["Person Name"],
      personRole: ref["Person Role"], platform: ref.Platform,
      response: ref.Response, referralGiven: ref["Referral Given"], notes: ref.Notes
    })
    setEditing(ref); setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); setForm(EMPTY_FORM) }

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true)
    if (editing) {
      await updateReferral(editing._rowIndex, {
        ID: editing.ID, Company: form.company,
        "Person Name": form.personName, "Person Role": form.personRole,
        Platform: form.platform, "Date Sent": editing["Date Sent"],
        Response: form.response, "Referral Given": form.referralGiven,
        Notes: form.notes, "Follow Up Date": editing["Follow Up Date"]
      })
    } else {
      await addReferral(form)
    }
    setSaving(false); closeForm()
  }

  async function handleDelete(ref) {
    await deleteReferral(ref._rowIndex)
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
          <h1 style={{ fontSize: isMobile ? "22px" : "30px", fontWeight: "800", color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>Referrals</h1>
          <p style={{ color: "#555", fontSize: "13px", marginTop: "6px" }}>
            {filtered.length} total ·{" "}
            <span style={{ color: todayCount >= 3 ? "#3fb950" : "#f5a623", fontWeight: "600" }}>
              {todayCount}/3 sent today
            </span>
          </p>
        </div>
        <button onClick={openAdd} style={{
          background: "#58a6ff", color: "#000", padding: "9px 18px",
          borderRadius: "8px", fontSize: "13px", fontWeight: "700",
          cursor: "pointer", border: "none", marginTop: "4px"
        }}>
          + Log Referral
        </button>
      </div>

      {/* Daily goal */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ color: "#888", fontSize: "13px", fontWeight: "500" }}>Daily referral goal</span>
          <span style={{ color: "#e0e0e0", fontSize: "13px", fontWeight: "700" }}>{todayCount} / 3</span>
        </div>
        <div style={{ background: "#111", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${goalPct}%`,
            background: todayCount >= 3 ? "#3fb950" : "#58a6ff",
            borderRadius: "999px",
            transition: "width 0.4s ease"
          }} />
        </div>
        {todayCount >= 3 && (
          <p style={{ color: "#3fb950", fontSize: "12px", fontWeight: "600", marginTop: "10px" }}>
            🎉 Daily goal reached!
          </p>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <input style={{ ...S.input, maxWidth: "220px" }} placeholder="Search company or person…" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterResponse} onChange={e => setFilterResponse(e.target.value)} style={{ ...S.select, width: "auto" }}>
          <option value="All">All Responses</option>
          {REFERRAL_RESPONSES.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...S.select, width: "auto" }}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="company-az">Company A–Z</option>
        </select>
        {(search || filterResponse !== "All") && (
          <button onClick={() => { setSearch(""); setFilterResponse("All") }} style={{ background: "transparent", border: "1px solid #21262d", color: "#8b949e", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", cursor: "pointer" }}>Clear</button>
        )}
        <span style={{ color: "#8b949e", fontSize: "12px", marginLeft: "auto" }}>{sorted.length} of {referrals.length}</span>
      </div>

      {/* Table */}
      <div style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🤝</div>
            <p style={{ color: "#e0e0e0", fontWeight: "600", fontSize: "14px" }}>No referrals logged yet</p>
            <p style={{ color: "#555", fontSize: "13px", marginTop: "4px" }}>Start reaching out — aim for 3 per day!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Company", "Person", "Their Role", "Platform", "Date Sent", "Response", "Referred?", "Follow Up", "Actions"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((ref, i) => {
                  const followUpDue = ref.Response === "Pending" &&
                    new Date() - new Date(ref["Date Sent"]) > 3 * 24 * 60 * 60 * 1000
                  return (
                    <tr key={i}
                      onClick={() => openEdit(ref)}
                      style={{ background: followUpDue ? "rgba(245,166,35,0.04)" : "transparent", transition: "background 0.15s", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#1e1e1e"}
                      onMouseLeave={e => e.currentTarget.style.background = followUpDue ? "rgba(245,166,35,0.04)" : "transparent"}
                    >
                      <td style={{ ...S.td, fontWeight: "600" }}>{ref.Company}</td>
                      <td style={S.tdMuted}>{ref["Person Name"]}</td>
                      <td style={S.tdMuted}>{ref["Person Role"]}</td>
                      <td style={S.tdMuted}>{ref.Platform}</td>
                      <td style={S.tdMuted}>{formatDate(ref["Date Sent"])}</td>
                      <td style={S.td}><StatusBadge status={ref.Response} /></td>
                      <td style={S.td}>
                        <span style={{ color: ref["Referral Given"] === "Yes" ? "#3fb950" : "#444", fontSize: "12px", fontWeight: "600" }}>
                          {ref["Referral Given"] === "Yes" ? "✓ Yes" : "Not yet"}
                        </span>
                      </td>
                      <td style={S.td}>
                        {followUpDue
                          ? <span style={{ color: "#f5a623", fontSize: "12px", fontWeight: "600" }}>⏰ Due now</span>
                          : <span style={{ color: "#555", fontSize: "12px" }}>{formatDate(ref["Follow Up Date"])}</span>
                        }
                      </td>
                      <td style={S.td} onClick={e => e.stopPropagation()}>
                        {confirmDelete === ref._rowIndex ? (
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", color: "#888" }}>Sure?</span>
                            <button onClick={() => handleDelete(ref)} style={{ background: "none", border: "none", color: "#f85149", fontSize: "12px", cursor: "pointer", fontWeight: "700" }}>Yes</button>
                            <button onClick={() => setConfirmDelete(null)} style={{ background: "none", border: "none", color: "#555", fontSize: "12px", cursor: "pointer" }}>No</button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => openEdit(ref)} style={{ background: "none", border: "none", color: "#58a6ff", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>Edit</button>
                            <button onClick={() => setConfirmDelete(ref._rowIndex)} style={{ background: "none", border: "none", color: "#f85149", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
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
                {editing ? "Edit Referral" : "Log Referral Message"}
              </h2>
              <button onClick={closeForm} style={{ background: "none", border: "none", color: "#555", fontSize: "20px", cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={S.label}>Company *</label>
                  <input required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={S.input} placeholder="e.g. Harman" />
                </div>
                <div>
                  <label style={S.label}>Person's Name *</label>
                  <input required value={form.personName} onChange={e => setForm({ ...form, personName: e.target.value })} style={S.input} placeholder="e.g. Karan Vashist" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={S.label}>Their Role</label>
                  <input value={form.personRole} onChange={e => setForm({ ...form, personRole: e.target.value })} style={S.input} placeholder="e.g. Engineering Lead" />
                </div>
                <div>
                  <label style={S.label}>Platform</label>
                  <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} style={S.select}>
                    {SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={S.label}>Response</label>
                  <select value={form.response} onChange={e => setForm({ ...form, response: e.target.value })} style={S.select}>
                    {REFERRAL_RESPONSES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Referral Given?</label>
                  <select value={form.referralGiven} onChange={e => setForm({ ...form, referralGiven: e.target.value })} style={S.select}>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={S.label}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...S.input, resize: "none" }} placeholder="What did you say? Any context..." />
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