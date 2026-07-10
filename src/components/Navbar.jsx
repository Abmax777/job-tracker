import { NavLink } from "react-router-dom"
import { useApp } from "../context/AppContext"
import { LayoutDashboard, FileText, Users, Calendar, TrendingUp, RefreshCw, Sparkles } from "lucide-react"
import { useState } from "react"
import { useIsMobile } from "../hooks/useIsMobile"

const NAV_ITEMS = [
  { to: "/dashboard",    icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/applications", icon: FileText,         label: "Applications" },
  { to: "/referrals",    icon: Users,            label: "Referrals"    },
  { to: "/interviews",   icon: Calendar,         label: "Interviews"   },
]

export default function Sidebar() {
  const { stats, loadAllData } = useApp()
  const [refreshing, setRefreshing] = useState(false)
  const isMobile = useIsMobile()

  async function handleRefresh() {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
  }

  const counts = {
    "/applications": stats.totalApplications,
    "/referrals":    stats.totalReferrals,
    "/interviews":   stats.totalInterviews,
  }

  // ── Mobile: fixed bottom tab bar ──────────────────────────────
  if (isMobile) {
    return (
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: "60px",
        background: "#0f0f0f", borderTop: "1px solid #1a1a1a",
        display: "flex", alignItems: "center", justifyContent: "space-around",
        zIndex: 40, paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "3px", textDecoration: "none", padding: "6px 12px",
              color: isActive ? "#58a6ff" : "#555",
              position: "relative",
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{ position: "relative" }}>
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {counts[to] > 0 && (
                    <span style={{
                      position: "absolute", top: "-4px", right: "-6px",
                      fontSize: "9px", fontWeight: "700",
                      background: "#58a6ff", color: "#000",
                      borderRadius: "999px", padding: "1px 4px",
                      lineHeight: 1.4,
                    }}>
                      {counts[to] > 99 ? "99+" : counts[to]}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "9px", fontWeight: isActive ? "700" : "500", letterSpacing: "0.02em" }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    )
  }

  // ── Desktop: sidebar ──────────────────────────────────────────
  return (
    <aside style={{
      position: "fixed", top: 0, left: 0, height: "100vh", width: "220px",
      background: "#0f0f0f", borderRight: "1px solid #1a1a1a",
      display: "flex", flexDirection: "column", padding: "0",
      zIndex: 40
    }}>

      {/* Logo */}
      <div style={{ padding: "28px 20px 24px", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <TrendingUp size={22} color="#58a6ff" strokeWidth={2.5} />
          <div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#ffffff", letterSpacing: "-0.3px" }}>
              JobTracker
            </div>
            <div style={{ fontSize: "11px", color: "#555", marginTop: "1px" }}>
              Abhinav Sawarn
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "600", color: "#444", letterSpacing: "0.08em", padding: "0 8px", marginBottom: "8px" }}>
          NAVIGATE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 10px", borderRadius: "6px", textDecoration: "none",
                transition: "all 0.15s ease",
                background: isActive ? "#1a1a1a" : "transparent",
                color: isActive ? "#ffffff" : "#666",
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.color = "#aaa"
                  e.currentTarget.style.background = "#111"
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.color = "#666"
                  e.currentTarget.style.background = "transparent"
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon size={16} strokeWidth={1.8} />
                <span style={{ fontSize: "13px", fontWeight: "500" }}>{label}</span>
              </div>
              {counts[to] > 0 && (
                <span style={{
                  fontSize: "11px", fontWeight: "600",
                  color: "#58a6ff", background: "rgba(88,166,255,0.1)",
                  padding: "1px 7px", borderRadius: "999px"
                }}>
                  {counts[to]}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Tools */}
      <div style={{ padding: "0 12px 12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "600", color: "#444", letterSpacing: "0.08em", padding: "0 8px", marginBottom: "8px" }}>
          TOOLS
        </div>
        <NavLink
          to="/jd-analyzer"
          style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: "10px",
            padding: "9px 10px", borderRadius: "6px", textDecoration: "none",
            transition: "all 0.15s ease",
            background: isActive ? "#1a1a1a" : "transparent",
            color: isActive ? "#ffffff" : "#666",
          })}
          onMouseEnter={e => { if (!e.currentTarget.getAttribute("aria-current")) { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.background = "#111" } }}
          onMouseLeave={e => { if (!e.currentTarget.getAttribute("aria-current")) { e.currentTarget.style.color = "#666"; e.currentTarget.style.background = "transparent" } }}
        >
          <Sparkles size={16} strokeWidth={1.8} />
          <span style={{ fontSize: "13px", fontWeight: "500" }}>JD Analyzer</span>
        </NavLink>
      </div>

      {/* Bottom stats */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid #1a1a1a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#444", letterSpacing: "0.08em" }}>
            OVERVIEW
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#444", display: "flex", alignItems: "center" }}
            onMouseEnter={e => e.currentTarget.style.color = "#888"}
            onMouseLeave={e => e.currentTarget.style.color = "#444"}
          >
            <RefreshCw size={13} strokeWidth={2} style={{ transition: "transform 0.6s", transform: refreshing ? "rotate(360deg)" : "none" }} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { label: "Active",       value: stats.activeApplications, color: "#58a6ff" },
            { label: "Pending refs", value: stats.pendingReferrals,   color: "#f5a623" },
            { label: "Offers",       value: stats.offers,             color: "#3fb950" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#555" }}>{label}</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  )
}
