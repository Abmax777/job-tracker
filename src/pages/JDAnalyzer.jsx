import { useState } from "react"
import { useIsMobile } from "../hooks/useIsMobile"

const CV_VARIANTS = ["Specialist (AOSP)", "Generic"]

const S = {
  card:   { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(22px) saturate(160%)", WebkitBackdropFilter: "blur(22px) saturate(160%)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)" },
  label:  { color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: "500", display: "block", marginBottom: "6px" },
  input:  { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e0e0e0", width: "100%", padding: "10px 12px", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit" },
  select: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e0e0e0", width: "100%", padding: "10px 12px", fontSize: "13px", outline: "none" },
  tag:    { fontSize: "12px", padding: "4px 10px", borderRadius: "999px", fontWeight: "500", display: "inline-block" },
}

function ScoreRing({ score }) {
  const color = score >= 75 ? "#3fb950" : score >= 55 ? "#f5a623" : "#f85149"
  const r = 36, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="#222" strokeWidth="7" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "22px", fontWeight: "800", color, letterSpacing: "-1px" }}>{score}</span>
        <span style={{ fontSize: "9px", color: "#555", fontWeight: "600" }}>/ 100</span>
      </div>
    </div>
  )
}

function TagList({ items, color, bg }) {
  if (!items?.length) return <span style={{ color: "#444", fontSize: "12px" }}>None</span>
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {items.map((item, i) => (
        <span key={i} style={{ ...S.tag, color, background: bg }}>{item}</span>
      ))}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={S.card}>
      <h3 style={{ fontSize: "11px", fontWeight: "600", color: "#444", letterSpacing: "0.08em", marginBottom: "14px" }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function JDAnalyzer() {
  const isMobile = useIsMobile()
  const [jd, setJd]               = useState("")
  const [selectedCv, setSelectedCv] = useState(CV_VARIANTS[0])
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState(null)

  async function handleAnalyze() {
    if (jd.trim().length < 50) {
      setError("Paste the full job description — this is too short.")
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ jd, selectedCv }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Request failed")
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const verdictColor = {
    "Strong Match":  "#3fb950",
    "Good Match":    "#58a6ff",
    "Partial Match": "#f5a623",
    "Weak Match":    "#f85149",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "860px" }}>

      {/* Header */}
      <div style={{ paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <h1 style={{ fontSize: isMobile ? "22px" : "30px", fontWeight: "800", color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>
          JD Analyzer
        </h1>
        <p style={{ color: "#555", fontSize: "13px", marginTop: "6px" }}>
          Paste a job description and get an instant match score, gaps, and talking points.
        </p>
      </div>

      {/* Input */}
      <div style={S.card}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={S.label}>CV Variant</label>
            <select value={selectedCv} onChange={e => setSelectedCv(e.target.value)} style={{ ...S.select, maxWidth: "280px" }}>
              {CV_VARIANTS.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Job Description</label>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              rows={isMobile ? 10 : 14}
              style={S.input}
              placeholder="Paste the full job description here — title, responsibilities, requirements, nice-to-haves, everything..."
            />
          </div>
          {error && (
            <p style={{ color: "#f85149", fontSize: "13px", margin: 0 }}>{error}</p>
          )}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              background: loading ? "#1e1e1e" : "#58a6ff",
              color: loading ? "#555" : "#000",
              border: "none", borderRadius: "8px",
              padding: "10px 24px", fontSize: "13px", fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              alignSelf: "flex-start", transition: "all 0.15s",
            }}
          >
            {loading ? "Analyzing…" : "Analyze Match"}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Score header */}
          <div style={{ ...S.card, display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            <ScoreRing score={result.match_score} />
            <div>
              <span style={{
                fontSize: "13px", fontWeight: "700", padding: "4px 12px", borderRadius: "999px",
                background: `${verdictColor[result.verdict]}22`,
                color: verdictColor[result.verdict] || "#fff",
              }}>
                {result.verdict}
              </span>
              <p style={{ color: "#ccc", fontSize: "14px", marginTop: "10px", marginBottom: "4px", fontWeight: "500" }}>
                {result.verdict_reason}
              </p>
              <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
                Recommended CV: <span style={{ color: "#58a6ff", fontWeight: "600" }}>{result.recommended_cv}</span>
                {result.cv_reason && <span> — {result.cv_reason}</span>}
              </p>
            </div>
          </div>

          {/* Two column grid */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>

            <Section title="✅ MATCHING SKILLS">
              <TagList items={result.matching_skills} color="#3fb950" bg="rgba(63,185,80,0.1)" />
            </Section>

            <Section title="❌ MISSING / WEAK AREAS">
              <TagList items={result.missing_skills} color="#f85149" bg="rgba(248,81,73,0.1)" />
            </Section>

            <Section title="💡 WHAT TO HIGHLIGHT">
              <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {result.highlight_points?.map((p, i) => (
                  <li key={i} style={{ color: "#ccc", fontSize: "13px" }}>{p}</li>
                ))}
              </ul>
            </Section>

            <Section title="⚠️ RED FLAGS">
              {result.red_flags?.length
                ? <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {result.red_flags.map((f, i) => (
                      <li key={i} style={{ color: "#f5a623", fontSize: "13px" }}>{f}</li>
                    ))}
                  </ul>
                : <span style={{ color: "#444", fontSize: "12px" }}>None identified</span>
              }
            </Section>

          </div>

          {/* Full width sections */}
          <Section title="🤝 REFERRAL TALKING POINTS">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {result.referral_talking_points?.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ color: "#58a6ff", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: "#ccc", fontSize: "13px" }}>{p}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="🎯 LIKELY INTERVIEW TOPICS">
            <TagList items={result.interview_likely_topics} color="#bc8cff" bg="rgba(188,140,255,0.1)" />
          </Section>

        </div>
      )}
    </div>
  )
}
