import { NavLink } from "react-router-dom"
import { useApp } from "../context/AppContext"

const NAV_ITEMS = [
  { to: "/dashboard",    icon: "⚡", label: "Dashboard"    },
  { to: "/applications", icon: "📋", label: "Applications" },
  { to: "/referrals",    icon: "🤝", label: "Referrals"    },
  { to: "/interviews",   icon: "🎯", label: "Interviews"   },
]

export default function Sidebar() {
  const { stats } = useApp()

  const counts = {
    "/applications": stats.totalApplications,
    "/referrals":    stats.totalReferrals,
    "/interviews":   stats.totalInterviews,
  }

  return (
    <aside
      className="fixed top-0 left-0 h-full w-56 flex flex-col py-6 px-3 z-40"
      style={{ background: "#161b22", borderRight: "1px solid #21262d" }}
    >
      {/* Logo */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, #2d6a9f, #58a6ff)" }}
          >
            🚀
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: "#e6edf3" }}>JobTracker</div>
            <div className="text-xs" style={{ color: "#8b949e" }}>by Abhinav</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? "active-nav" : "inactive-nav"
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? "rgba(45, 106, 159, 0.15)" : "transparent",
              color: isActive ? "#58a6ff" : "#8b949e",
              borderLeft: isActive ? "2px solid #58a6ff" : "2px solid transparent",
            })}
          >
            <div className="flex items-center gap-2.5">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
            {counts[to] > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(88, 166, 255, 0.15)", color: "#58a6ff" }}
              >
                {counts[to]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom stats */}
      <div className="px-3 py-3 rounded-xl mt-4" style={{ background: "#0d0f14", border: "1px solid #21262d" }}>
        <div className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>QUICK STATS</div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span style={{ color: "#8b949e" }}>Active</span>
            <span style={{ color: "#58a6ff" }} className="font-semibold">{stats.activeApplications}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "#8b949e" }}>Pending refs</span>
            <span style={{ color: "#d29922" }} className="font-semibold">{stats.pendingReferrals}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "#8b949e" }}>Offers</span>
            <span style={{ color: "#3fb950" }} className="font-semibold">{stats.offers}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}