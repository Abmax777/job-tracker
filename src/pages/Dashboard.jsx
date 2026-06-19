import { useApp } from "../context/AppContext"
import FollowUpAlert from "../components/FollowUpAlert"
import StatusBadge from "../components/StatusBadge"
import { formatDate } from "../services/sheetsService"
import { TrendingUp, Users, FileText, Award, ChevronRight } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

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
      <div style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: "8px", padding: "10px 14px" }}>
        <p style={{ color: "#888", fontSize: "11px", margin: "0 0 4px" }}>{label}</p>
        <p style={{ color: "#fff", fontSize: "14px", fontWeight: "700", margin: 0 }}>{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { applications, referrals, stats, loading } = useApp()

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid #222", borderTop: "2px solid #58a6ff", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#555", fontSize: "13px" }}>Loading...</p>
      </div>
    </div>
  )

  const pipelineData = PIPELINE.map(p => ({
    ...p,
    count: applications.filter(a => a.Status === p.status).length
  }))

  const barData = pipelineData.map(p => ({ name: p.short, count: p.count, color: p.color }))

  const recentApps = [...applications]
    .sort((a, b) => new Date(b["Date Applied"]) - new Date(a["Date Applied"]))
    .slice(0, 5)

  const recentReferrals = [...referrals]
    .sort((a, b) => new Date(b["Date Sent"]) - new Date(a["Date Sent"]))
    .slice(0, 4)

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* Hero header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "24px" }}>
        <p style={{ color: "#555", fontSize: "12px", marginBottom: "6px", letterSpacing: "0.05em" }}>
          {today.toUpperCase()}
        </p>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>
          Mission Control
        </h1>
        <p style={{ color: "#555", fontSize: "13px", marginTop: "6px", margin: "6px 0 0" }}>
          {stats.activeApplications > 0
            ? `${stats.activeApplications} active applications in your pipeline`
            : "Start applying to build your pipeline"
          }
        </p>
      </div>

      <FollowUpAlert />

      {/* Big stat numbers — Netflix style */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "#1a1a1a", borderRadius: "12px", overflow: "hidden" }}>
        {[
          { label: "Applications", value: stats.totalApplications, icon: FileText,   color: "#58a6ff", sub: "total sent"    },
          { label: "Active",       value: stats.activeApplications, icon: TrendingUp, color: "#ffffff", sub: "in pipeline"  },
          { label: "Referrals",    value: stats.totalReferrals,     icon: Users,      color: "#f5a623", sub: "messages sent"},
          { label: "Offers",       value: stats.offers,             icon: Award,      color: "#3fb950", sub: "received"     },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} style={{
            background: "161616", padding: "28px 24px",
            transition: "background 0.2s ease", cursor: "default"
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#161616"}
            onMouseLeave={e => e.currentTarget.style.background = "#0f0f0f"}
          >
            <Icon size={16} color={color} strokeWidth={1.8} style={{ marginBottom: "16px" }} />
            <div style={{ fontSize: "42px", fontWeight: "800", color, lineHeight: 1, letterSpacing: "-1px" }}>
              {value}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff", marginTop: "8px" }}>{label}</div>
            <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Pipeline + Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* Pipeline stages */}
        <div>
          <h2 style={{ fontSize: "11px", fontWeight: "600", color: "#444", letterSpacing: "0.08em", marginBottom: "16px" }}>
            PIPELINE BREAKDOWN
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {pipelineData.map(stage => (
              <div key={stage.status} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderRadius: "8px", background: "161616",
                transition: "background 0.15s", cursor: "default"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#161616"}
                onMouseLeave={e => e.currentTarget.style.background = "#0f0f0f"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "3px", height: "20px", borderRadius: "2px", background: stage.color }} />
                  <span style={{ fontSize: "13px", color: "#888" }}>{stage.status}</span>
                </div>
                <span style={{ fontSize: "20px", fontWeight: "700", color: stage.count > 0 ? stage.color : "#333" }}>
                  {stage.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div>
          <h2 style={{ fontSize: "11px", fontWeight: "600", color: "#444", letterSpacing: "0.08em", marginBottom: "16px" }}>
            VISUAL BREAKDOWN
          </h2>
          <div style={{ background: "161616", borderRadius: "8px", padding: "20px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={20}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => <Cell key={i} fill={entry.color} opacity={entry.count === 0 ? 0.2 : 1} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* Recent applications */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "11px", fontWeight: "600", color: "#444", letterSpacing: "0.08em", margin: 0 }}>
              RECENT APPLICATIONS
            </h2>
            <ChevronRight size={14} color="#444" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {recentApps.length === 0 ? (
              <p style={{ color: "#444", fontSize: "13px", padding: "16px 0" }}>No applications yet</p>
            ) : recentApps.map((app, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderRadius: "8px", background: "161616",
                transition: "background 0.15s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#161616"}
                onMouseLeave={e => e.currentTarget.style.background = "#0f0f0f"}
              >
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#e0e0e0", margin: 0 }}>{app.Company}</p>
                  <p style={{ fontSize: "11px", color: "#555", margin: "2px 0 0" }}>{app.Role} · {formatDate(app["Date Applied"])}</p>
                </div>
                <StatusBadge status={app.Status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent referrals */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "11px", fontWeight: "600", color: "#444", letterSpacing: "0.08em", margin: 0 }}>
              RECENT REFERRALS
            </h2>
            <ChevronRight size={14} color="#444" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {recentReferrals.length === 0 ? (
              <p style={{ color: "#444", fontSize: "13px", padding: "16px 0" }}>No referrals yet — aim for 3 today</p>
            ) : recentReferrals.map((ref, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderRadius: "8px", background: "161616",
                transition: "background 0.15s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#161616"}
                onMouseLeave={e => e.currentTarget.style.background = "#0f0f0f"}
              >
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#e0e0e0", margin: 0 }}>{ref.Company}</p>
                  <p style={{ fontSize: "11px", color: "#555", margin: "2px 0 0" }}>{ref["Person Name"]} · {formatDate(ref["Date Sent"])}</p>
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