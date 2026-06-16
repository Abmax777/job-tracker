import { useApp } from "../context/AppContext"
import FollowUpAlert from "../components/FollowUpAlert"
import StatusBadge from "../components/StatusBadge"
import { formatDate } from "../services/sheetsService"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts"

const PIPELINE = [
  { status: "Applied",             color: "#58a6ff" },
  { status: "Referral Pending",    color: "#d29922" },
  { status: "In Review",           color: "#bc8cff" },
  { status: "Interview Scheduled", color: "#3fb950" },
  { status: "Offer",               color: "#3fb950" },
  { status: "Rejected",            color: "#f85149" },
]

const CARD_STYLE = {
  background: "#161b22",
  border: "1px solid #21262d",
  borderRadius: "12px",
  padding: "20px"
}

const CUSTOM_TOOLTIP_STYLE = {
  background: "#161b22",
  border: "1px solid #21262d",
  borderRadius: "8px",
  color: "#e6edf3",
  fontSize: "12px"
}

export default function Dashboard() {
  const { applications, referrals, interviews, stats, loading } = useApp()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm animate-pulse" style={{ color: "#8b949e" }}>Loading mission control...</div>
      </div>
    )
  }

  const pipelineData = PIPELINE.map(p => ({
    ...p,
    count: applications.filter(a => a.Status === p.status).length
  }))

  const barData = pipelineData.map(p => ({
    name: p.status.split(" ")[0],
    count: p.count,
    fill: p.color
  }))

  const pieData = pipelineData.filter(p => p.count > 0)

  const recentApps = [...applications]
    .sort((a, b) => new Date(b["Date Applied"]) - new Date(a["Date Applied"]))
    .slice(0, 5)

  const recentReferrals = [...referrals]
    .sort((a, b) => new Date(b["Date Sent"]) - new Date(a["Date Sent"]))
    .slice(0, 5)

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#e6edf3" }}>Mission Control</h1>
        <p className="text-sm mt-1" style={{ color: "#8b949e" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <FollowUpAlert />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: stats.totalApplications, color: "#58a6ff", icon: "📋" },
          { label: "Active Pipeline",    value: stats.activeApplications, color: "#bc8cff", icon: "⚡" },
          { label: "Referrals Sent",     value: stats.totalReferrals,     color: "#d29922", icon: "🤝" },
          { label: "Offers",             value: stats.offers,             color: "#3fb950", icon: "🎉" },
        ].map(({ label, value, color, icon }) => (
          <div
            key={label}
            style={{
              ...CARD_STYLE,
              borderTop: `2px solid ${color}`,
            }}
          >
            <div className="text-xl mb-2">{icon}</div>
            <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
            <div className="text-xs" style={{ color: "#8b949e" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div style={CARD_STYLE}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: "#8b949e", letterSpacing: "0.05em" }}>
          APPLICATION PIPELINE
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {pipelineData.map(stage => (
            <div
              key={stage.status}
              className="rounded-xl p-3 text-center"
              style={{ background: `${stage.color}12`, border: `1px solid ${stage.color}30` }}
            >
              <div className="text-2xl font-bold" style={{ color: stage.color }}>{stage.count}</div>
              <div className="text-xs mt-1 leading-tight" style={{ color: "#8b949e" }}>{stage.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      {applications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div style={CARD_STYLE}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "#8b949e", letterSpacing: "0.05em" }}>
              BY STATUS
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8b949e" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#8b949e" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={CARD_STYLE}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "#8b949e", letterSpacing: "0.05em" }}>
              PIPELINE SPLIT
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="count"
                  paddingAngle={3}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div style={CARD_STYLE}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#8b949e", letterSpacing: "0.05em" }}>
            RECENT APPLICATIONS
          </h2>
          {recentApps.length === 0 ? (
            <p className="text-sm" style={{ color: "#8b949e" }}>No applications yet — start applying!</p>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#e6edf3" }}>{app.Company}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8b949e" }}>{app.Role} · {formatDate(app["Date Applied"])}</p>
                  </div>
                  <StatusBadge status={app.Status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={CARD_STYLE}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#8b949e", letterSpacing: "0.05em" }}>
            RECENT REFERRALS
          </h2>
          {recentReferrals.length === 0 ? (
            <p className="text-sm" style={{ color: "#8b949e" }}>No referrals logged — aim for 3 today!</p>
          ) : (
            <div className="space-y-3">
              {recentReferrals.map((ref, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#e6edf3" }}>{ref.Company}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8b949e" }}>{ref["Person Name"]} · {formatDate(ref["Date Sent"])}</p>
                  </div>
                  <StatusBadge status={ref.Response} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}