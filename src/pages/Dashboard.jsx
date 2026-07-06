import { useApp } from "../context/AppContext"
import FollowUpAlert from "../components/FollowUpAlert"
import StatusBadge from "../components/StatusBadge"
import { formatDate } from "../services/sheetsService"
import { TrendingUp, Users, FileText, Award, ChevronRight, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from "recharts"
import { useNavigate } from "react-router-dom"

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
        background: "#1e1e1e",
        border: "1px solid #2a2a2a",
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
  const { applications, referrals, stats, loading } = useApp()
  const navigate = useNavigate()

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
      <div style={{ paddingBottom: "20px", borderBottom: "1px solid #1e1e1e" }}>
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

      <FollowUpAlert />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
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
              background: alert ? "rgba(245,166,35,0.06)" : "#1a1a1a",
              borderRadius: "12px",
              padding: "24px 20px",
              transition: "background 0.2s ease",
              cursor: onClick ? "pointer" : "default",
              border: alert ? "1px solid rgba(245,166,35,0.25)" : "1px solid #222",
              position: "relative",
            }}
            onMouseEnter={e => e.currentTarget.style.background = alert ? "rgba(245,166,35,0.1)" : "#202020"}
            onMouseLeave={e => e.currentTarget.style.background = alert ? "rgba(245,166,35,0.06)" : "#1a1a1a"}
          >
            <Icon size={16} color={color} strokeWidth={1.8} style={{ marginBottom: "16px", opacity: 0.8 }} />
            <div style={{
              fontSize: "40px", fontWeight: "800",
              color, lineHeight: 1,
              letterSpacing: "-1px"
            }}>
              {value}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#ccc", marginTop: "8px" }}>
              {label}
            </div>
            <div style={{ fontSize: "11px", color: alert ? "#8b6914" : "#444", marginTop: "2px" }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Pipeline stages */}
        <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "20px", border: "1px solid #222" }}>
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
                onMouseEnter={e => e.currentTarget.style.background = "#222"}
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
        <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "20px", border: "1px solid #222" }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Recent applications */}
        <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "20px", border: "1px solid #222" }}>
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
                onMouseEnter={e => e.currentTarget.style.background = "#222"}
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
        <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "20px", border: "1px solid #222" }}>
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
                onMouseEnter={e => e.currentTarget.style.background = "#222"}
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
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}