import { useApp } from "../context/AppContext"
import { useIsMobile } from "../hooks/useIsMobile"
import FollowUpAlert from "../components/FollowUpAlert"
import StatusBadge from "../components/StatusBadge"
import { formatDate } from "../services/sheetsService"
import { TrendingUp, Users, FileText, Award, ChevronRight, Clock, ExternalLink, CheckCircle, Target } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from "recharts"
import { useNavigate } from "react-router-dom"

const DAILY_REFERRAL_GOAL = 3

function getUrgency(deadline) {
  if (!deadline) return null
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const d   = new Date(deadline); d.setHours(0, 0, 0, 0)
  const days = Math.round((d - now) / (1000 * 60 * 60 * 24))
  if (days < 0)   return { label: "OVERDUE",       color: "#f85149", bg: "rgba(248,81,73,0.12)",  border: "rgba(248,81,73,0.35)",  pulse: true  }
  if (days === 0)  return { label: "DUE TODAY",    color: "#f85149", bg: "rgba(248,81,73,0.10)",  border: "rgba(248,81,73,0.35)",  pulse: true  }
  if (days === 1)  return { label: "DUE TOMORROW", color: "#f5a623", bg: "rgba(245,166,35,0.10)", border: "rgba(245,166,35,0.3)",  pulse: false }
  if (days <= 3)   return { label: `${days}D LEFT`,color: "#f5a623", bg: "rgba(245,166,35,0.08)", border: "rgba(245,166,35,0.25)", pulse: false }
  return               { label: `${days}D LEFT`,   color: "#58a6ff", bg: "rgba(88,166,255,0.07)", border: "rgba(88,166,255,0.2)",  pulse: false }
}

function ActionCard({ item, onDismiss, isMobile }) {
  const urgency = getUrgency(item.Deadline)
  const isOA = item.Type === "OA"
  const accentColor  = isOA ? "#f5a623" : "#58a6ff"
  const accentBg     = isOA ? "rgba(245,166,35,0.07)" : "rgba(88,166,255,0.07)"
  const accentBorder = isOA ? "rgba(245,166,35,0.22)" : "rgba(88,166,255,0.2)"

  // Build a Google Calendar deep link for interview items
  const calendarLink = item.Type === "Interview" && item.Deadline
    ? (() => {
        const d = item.Deadline.replace(/-/g, "")
        const title = encodeURIComponent(`Interview – ${item.Company}`)
        return `https://calendar.google.com/calendar/r/eventedit?text=${title}&dates=${d}/${d}`
      })()
    : null

  return (
    <div style={{
      background: accentBg,
      border: `1px solid ${urgency?.border || accentBorder}`,
      backdropFilter: "blur(22px) saturate(160%)",
      WebkitBackdropFilter: "blur(22px) saturate(160%)",
      borderRadius: "12px",
      padding: isMobile ? "14px" : "18px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
      animation: urgency?.pulse ? "urgentPulse 2s ease-in-out infinite" : "none",
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "15px" }}>{isOA ? "⚡" : "📅"}</span>
          <span style={{ fontWeight: "700", color: "#fff", fontSize: isMobile ? "13px" : "14px" }}>
            {item.Company || "Unknown Company"}
          </span>
          <span style={{
            fontSize: "9px", fontWeight: "700", letterSpacing: "0.06em",
            padding: "2px 8px", borderRadius: "999px",
            background: `${accentColor}22`, color: accentColor,
          }}>
            {isOA ? "ONLINE ASSESSMENT" : "INTERVIEW"}
          </span>
          {item.Role && !isMobile && (
            <span style={{ fontSize: "11px", color: "#555" }}>· {item.Role}</span>
          )}
        </div>
        {urgency && (
          <span style={{
            fontSize: "10px", fontWeight: "700", letterSpacing: "0.05em",
            padding: "3px 9px", borderRadius: "999px", flexShrink: 0,
            background: urgency.bg, color: urgency.color, border: `1px solid ${urgency.border}`,
          }}>
            {urgency.label}
          </span>
        )}
      </div>

      {/* Subject */}
      <p style={{
        color: "#666", fontSize: "12px", margin: "0 0 12px",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {item.Subject}
      </p>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        {item.Link && (
          <a href={item.Link} target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              fontSize: "12px", fontWeight: "600", color: accentColor,
              background: `${accentColor}18`, border: `1px solid ${accentColor}33`,
              padding: "5px 12px", borderRadius: "7px", textDecoration: "none",
            }}
          >
            <ExternalLink size={11} />
            {isOA ? "Open Challenge" : "Join Meeting"}
          </a>
        )}
        {calendarLink && (
          <a href={calendarLink} target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              fontSize: "12px", fontWeight: "600", color: "#a78bfa",
              background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)",
              padding: "5px 12px", borderRadius: "7px", textDecoration: "none",
            }}
          >
            <ExternalLink size={11} />
            + Calendar
          </a>
        )}
        <button onClick={() => onDismiss(item)}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            fontSize: "12px", fontWeight: "600", color: "#555",
            background: "transparent", border: "1px solid rgba(255,255,255,0.09)",
            padding: "5px 12px", borderRadius: "7px", cursor: "pointer",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#3fb950"; e.currentTarget.style.borderColor = "rgba(63,185,80,0.3)" }}
          onMouseLeave={e => { e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)" }}
        >
          <CheckCircle size={11} />
          Done
        </button>
      </div>
    </div>
  )
}

const PIPELINE = [
  { status: "Applied",             color: "#58a6ff", short: "Applied"   },
  { status: "Referral Pending",    color: "#f5a623", short: "Referral"  },
  { status: "In Review",           color: "#bc8cff", short: "Review"    },
  { status: "Interview Scheduled", color: "#3fb950", short: "Interview" },
  { status: "Offer",               color: "#3fb950", short: "Offer"     },
  { status: "Rejected",            color: "#f85149", short: "Rejected"  },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(20,20,40,0.7)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        padding: "10px 14px"
      }}>
        <p style={{ color: "#666", fontSize: "11px", margin: "0 0 4px" }}>{label}</p>
        <p style={{ color: "#fff", fontSize: "16px", fontWeight: "700", margin: 0 }}>{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { applications, referrals, stats, loading, actionItems, dismissActionItem } = useApp()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const todayStr = new Date().toISOString().split("T")[0]
  const referralsToday = referrals.filter(r => r["Date Sent"] === todayStr).length

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "32px", height: "32px",
          border: "2px solid #222",
          borderTop: "2px solid #58a6ff",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 12px"
        }} />
        <p style={{ color: "#555", fontSize: "13px" }}>Loading...</p>
      </div>
    </div>
  )

  const pipelineData = PIPELINE.map(p => ({
    ...p,
    count: applications.filter(a => a.Status === p.status).length
  }))

  const barData = pipelineData.map(p => ({
    name: p.short,
    count: p.count,
    color: p.color
  }))

  const staleCount = applications.filter(
    a => !["Rejected", "Withdrawn", "Offer"].includes(a.Status)
      && new Date() - new Date(a["Date Applied"]) > 7 * 24 * 60 * 60 * 1000
  ).length

  // Weekly trend — last 8 weeks
  const weeklyData = (() => {
    const weeks = []
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - i * 7 - now.getDay())
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      const count = applications.filter(a => {
        const d = new Date(a["Date Applied"])
        return d >= weekStart && d <= weekEnd
      }).length
      const label = weekStart.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      weeks.push({ week: label, count })
    }
    return weeks
  })()

  const recentApps = [...applications]
    .sort((a, b) => new Date(b["Date Applied"]) - new Date(a["Date Applied"]))
    .slice(0, 5)

  const recentReferrals = [...referrals]
    .sort((a, b) => new Date(b["Date Sent"]) - new Date(a["Date Sent"]))
    .slice(0, 4)

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long"
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* Page header */}
      <div style={{ paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ color: "#444", fontSize: "11px", letterSpacing: "0.08em", marginBottom: "6px" }}>
          {today.toUpperCase()}
        </p>
        <h1 style={{
          fontSize: "30px", fontWeight: "800",
          color: "#ffffff", margin: 0,
          letterSpacing: "-0.5px", lineHeight: 1.1
        }}>
          Mission Control
        </h1>
        <p style={{ color: "#555", fontSize: "13px", marginTop: "8px" }}>
          {stats.activeApplications > 0
            ? `${stats.activeApplications} active applications in your pipeline`
            : "Start applying to build your pipeline"
          }
        </p>
      </div>

      {/* ── Today's Focus ─────────────────────────────────────── */}
      {actionItems.length > 0 ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#f85149", letterSpacing: "0.1em" }}>
              ⚠ TODAY'S FOCUS
            </span>
            <span style={{
              fontSize: "9px", fontWeight: "700", padding: "1px 7px",
              background: "rgba(248,81,73,0.15)", color: "#f85149", borderRadius: "999px",
            }}>
              {actionItems.length} PENDING
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {actionItems.map(item => (
              <ActionCard
                key={item._rowIndex}
                item={item}
                onDismiss={dismissActionItem}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          backdropFilter: "blur(22px) saturate(160%)",
          WebkitBackdropFilter: "blur(22px) saturate(160%)",
          borderRadius: "12px", padding: "18px 20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Target size={16} color="#a78bfa" strokeWidth={1.8} />
              <div>
                <p style={{ fontSize: "10px", fontWeight: "700", color: "#444", letterSpacing: "0.08em", margin: 0 }}>
                  TODAY'S FOCUS
                </p>
                <p style={{ fontSize: "13px", color: "#ccc", margin: "3px 0 0", fontWeight: "500" }}>
                  {referralsToday >= DAILY_REFERRAL_GOAL
                    ? "Daily referral goal met 🎉 Keep it up!"
                    : referralsToday > 0
                      ? `${DAILY_REFERRAL_GOAL - referralsToday} more referral${DAILY_REFERRAL_GOAL - referralsToday > 1 ? "s" : ""} to hit your goal`
                      : "Send 3 referrals today to stay active"
                  }
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "22px", fontWeight: "800", color: referralsToday >= DAILY_REFERRAL_GOAL ? "#3fb950" : "#a78bfa" }}>
                  {referralsToday}
                </span>
                <span style={{ fontSize: "14px", color: "#444", fontWeight: "600" }}>
                  &nbsp;/ {DAILY_REFERRAL_GOAL}
                </span>
              </div>
              {/* Progress ring */}
              <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="22" cy="22" r="17" fill="none" stroke="#1a1a2e" strokeWidth="4" />
                <circle cx="22" cy="22" r="17" fill="none"
                  stroke={referralsToday >= DAILY_REFERRAL_GOAL ? "#3fb950" : "#a78bfa"}
                  strokeWidth="4"
                  strokeDasharray={`${Math.min(referralsToday / DAILY_REFERRAL_GOAL, 1) * 2 * Math.PI * 17} ${2 * Math.PI * 17}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.6s ease" }}
                />
              </svg>
            </div>
          </div>
          {referralsToday < DAILY_REFERRAL_GOAL && (
            <div
              onClick={() => navigate("/referrals")}
              style={{
                marginTop: "12px", paddingTop: "12px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                fontSize: "12px", color: "#a78bfa", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: "4px",
              }}
            >
              Log a referral →
            </div>
          )}
        </div>
      )}

      <FollowUpAlert />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(5, 1fr)", gap: isMobile ? "8px" : "12px" }}>
        {[
          { label: "Applications", value: stats.totalApplications,  icon: FileText,   color: "#58a6ff", sub: "total sent",     onClick: null            },
          { label: "Active",       value: stats.activeApplications, icon: TrendingUp, color: "#ffffff", sub: "in pipeline",   onClick: null            },
          { label: "Referrals",    value: stats.totalReferrals,     icon: Users,      color: "#f5a623", sub: "messages sent", onClick: null            },
          { label: "Offers",       value: stats.offers,             icon: Award,      color: "#3fb950", sub: "received",      onClick: null            },
          {
            label: "Stale",
            value: staleCount,
            icon: Clock,
            color: staleCount > 0 ? "#f5a623" : "#3a3a3a",
            sub: "no update 7d+",
            onClick: () => navigate("/applications"),
            alert: staleCount > 0,
          },
        ].map(({ label, value, icon: Icon, color, sub, onClick, alert }) => (
          <div
            key={label}
            onClick={onClick}
            style={{
              background: alert ? "rgba(245,166,35,0.08)" : "rgba(255,255,255,0.04)",
              backdropFilter: "blur(22px) saturate(160%)",
              WebkitBackdropFilter: "blur(22px) saturate(160%)",
              borderRadius: "12px",
              padding: isMobile ? "14px 10px" : "24px 20px",
              transition: "background 0.2s ease, border-color 0.2s ease",
              cursor: onClick ? "pointer" : "default",
              border: alert ? "1px solid rgba(245,166,35,0.3)" : "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
              position: "relative",
            }}
            onMouseEnter={e => e.currentTarget.style.background = alert ? "rgba(245,166,35,0.14)" : "rgba(255,255,255,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = alert ? "rgba(245,166,35,0.08)" : "rgba(255,255,255,0.04)"}
          >
            <Icon size={isMobile ? 13 : 16} color={color} strokeWidth={1.8} style={{ marginBottom: isMobile ? "8px" : "16px", opacity: 0.8 }} />
            <div style={{
              fontSize: isMobile ? "24px" : "40px", fontWeight: "800",
              color, lineHeight: 1,
              letterSpacing: "-1px"
            }}>
              {value}
            </div>
            <div style={{ fontSize: isMobile ? "10px" : "13px", fontWeight: "600", color: "#ccc", marginTop: isMobile ? "4px" : "8px" }}>
              {label}
            </div>
            <div style={{ fontSize: "10px", color: alert ? "#8b6914" : "#444", marginTop: "2px", display: isMobile ? "none" : "block" }}>
              {sub}
            </div>
            {alert && onClick && (
              <span style={{ position: "absolute", top: "14px", right: "14px", fontSize: "10px", color: "#8b6914" }}>
                View →
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Pipeline + Chart */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>

        {/* Pipeline stages */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(22px) saturate(160%)", WebkitBackdropFilter: "blur(22px) saturate(160%)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
          <h2 style={{
            fontSize: "11px", fontWeight: "600",
            color: "#444", letterSpacing: "0.08em",
            marginBottom: "16px"
          }}>
            PIPELINE BREAKDOWN
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {pipelineData.map(stage => (
              <div
                key={stage.status}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 12px", borderRadius: "8px",
                  transition: "background 0.15s", cursor: "default"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "3px", height: "18px",
                    borderRadius: "2px",
                    background: stage.count > 0 ? stage.color : "#2a2a2a"
                  }} />
                  <span style={{ fontSize: "13px", color: stage.count > 0 ? "#aaa" : "#444" }}>
                    {stage.status}
                  </span>
                </div>
                <span style={{
                  fontSize: "20px", fontWeight: "700",
                  color: stage.count > 0 ? stage.color : "#333"
                }}>
                  {stage.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly trend chart */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(22px) saturate(160%)", WebkitBackdropFilter: "blur(22px) saturate(160%)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
          <h2 style={{
            fontSize: "11px", fontWeight: "600",
            color: "#444", letterSpacing: "0.08em",
            marginBottom: "16px"
          }}>
            APPLICATIONS PER WEEK
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid stroke="#1e1e1e" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "#555" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#555" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#2a2a2a", strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#58a6ff"
                strokeWidth={2}
                dot={{ fill: "#58a6ff", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#58a6ff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>

        {/* Recent applications */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(22px) saturate(160%)", WebkitBackdropFilter: "blur(22px) saturate(160%)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
          <div onClick={() => navigate("/applications")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.querySelector("svg").style.color = "#58a6ff"}
            onMouseLeave={e => e.currentTarget.querySelector("svg").style.color = "#555"}>
            <h2 style={{ fontSize: "11px", fontWeight: "600", color: "#444", letterSpacing: "0.08em", margin: 0 }}>
              RECENT APPLICATIONS
            </h2>
            <ChevronRight size={14} color="#555" style={{ transition: "color 0.15s" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {recentApps.length === 0 ? (
              <p style={{ color: "#444", fontSize: "13px", padding: "12px 0" }}>
                No applications yet — start applying!
              </p>
            ) : recentApps.map((app, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: "8px",
                  transition: "background 0.15s", cursor: "default"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#e0e0e0", margin: 0 }}>
                    {app.Company}
                  </p>
                  <p style={{ fontSize: "11px", color: "#555", margin: "2px 0 0" }}>
                    {app.Role} · {formatDate(app["Date Applied"])}
                  </p>
                </div>
                <StatusBadge status={app.Status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent referrals */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(22px) saturate(160%)", WebkitBackdropFilter: "blur(22px) saturate(160%)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
          <div onClick={() => navigate("/referrals")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.querySelector("svg").style.color = "#58a6ff"}
            onMouseLeave={e => e.currentTarget.querySelector("svg").style.color = "#555"}>
            <h2 style={{ fontSize: "11px", fontWeight: "600", color: "#444", letterSpacing: "0.08em", margin: 0 }}>
              RECENT REFERRALS
            </h2>
            <ChevronRight size={14} color="#555" style={{ transition: "color 0.15s" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {recentReferrals.length === 0 ? (
              <p style={{ color: "#444", fontSize: "13px", padding: "12px 0" }}>
                No referrals yet — aim for 3 today
              </p>
            ) : recentReferrals.map((ref, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: "8px",
                  transition: "background 0.15s", cursor: "default"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#e0e0e0", margin: 0 }}>
                    {ref.Company}
                  </p>
                  <p style={{ fontSize: "11px", color: "#555", margin: "2px 0 0" }}>
                    {ref["Person Name"]} · {formatDate(ref["Date Sent"])}
                  </p>
                </div>
                <StatusBadge status={ref.Response} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes urgentPulse {
          0%, 100% { box-shadow: 0 4px 24px rgba(0,0,0,0.35), 0 0 0 0 rgba(248,81,73,0.25); }
          50%       { box-shadow: 0 4px 24px rgba(0,0,0,0.35), 0 0 0 6px rgba(248,81,73,0); }
        }
      `}</style>
    </div>
  )
}