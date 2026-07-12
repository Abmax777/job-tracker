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
  const { stats, loadAllData, actionItems } = useApp()
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

  const urgentCount = (actionItems || []).length

  // ── Mobile: glass bottom tab bar ─────────────────────────────
  if (isMobile) {
    return (
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: "60px",
        background: "rgba(6,6,15,0.72)",
        backdropFilter: "blur(30px) saturate(160%)",
        WebkitBackdropFilter: "blur(30px) saturate(160%)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
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
              color: isActive ? "#a78bfa" : "rgba(255,255,255,0.35)",
              position: "relative",
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{ position: "relative" }}>
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {/* Urgent action items badge on Dashboard icon */}
                  {to === "/dashboard" && urgentCount > 0 && (
                    <span style={{
                      position: "absolute", top: "-4px", right: "-6px",
                      fontSize: "9px", fontWeight: "700",
                      background: "#f85149", color: "#fff",
                      borderRadius: "999px", padding: "1px 4px", lineHeight: 1.4,
                    }}>
                      {urgentCount}
                    </span>
                  )}
                  {to !== "/dashboard" && counts[to] > 0 && (
                    <span style={{
                      position: "absolute", top: "-4px", right: "-6px",
                      fontSize: "9px", fontWeight: "700",
                      background: "#a78bfa", color: "#06060f",
                      borderRadius: "999px", padding: "1px 4px", lineHeight: 1.4,
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

  // ── Desktop: glass sidebar ────────────────────────────────────
  return (
    <aside style={{
      position: "fixed", top: 0, left: 0, height: "100vh", width: "220px",
      background: "rgba(6,6,15,0.65)",
      backdropFilter: "blur(40px) saturate(180%)",
      WebkitBackdropFilter: "blur(40px) saturate(180%)",
      borderRight: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "4px 0 40px rgba(0,0,0,0.35)",
      display: "flex", flexDirection: "column",
      zIndex: 40
    }}>

      {/* Logo */}
      <div style={{ padding: "28px 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <TrendingUp size={22} color="#a78bfa" strokeWidth={2.5} />
          <div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#ffffff", letterSpacing: "-0.3px" }}>
              JobTracker
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", marginTop: "1px" }}>
              Abhinav Sawarn
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "600", color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em", padding: "0 8px", marginBottom: "8px" }}>
          NAVIGATE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 10px", borderRadius: "8px", textDecoration: "none",
                transition: "all 0.15s ease",
                background: isActive ? "rgba(167,139,250,0.14)" : "transparent",
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.38)",
                borderLeft: isActive ? "2px solid #a78bfa" : "2px solid transparent",
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.getAttribute("aria-current")) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.75)"
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)"
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.getAttribute("aria-current")) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.38)"
                  e.currentTarget.style.background = "transparent"
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon size={16} strokeWidth={1.8} />
                <span style={{ fontSize: "13px", fontWeight: "500" }}>{label}</span>
              </div>
              {/* Urgent badge for Dashboard, count badge for other pages */}
              {to === "/dashboard" && urgentCount > 0 ? (
                <span style={{
                  fontSize: "11px", fontWeight: "700",
                  color: "#fff", background: "#f85149",
                  padding: "1px 7px", borderRadius: "999px"
                }}>
                  {urgentCount}
                </span>
              ) : to !== "/dashboard" && counts[to] > 0 ? (
                <span style={{
                  fontSize: "11px", fontWeight: "600",
                  color: "#a78bfa", background: "rgba(167,139,250,0.15)",
                  padding: "1px 7px", borderRadius: "999px"
                }}>
                  {counts[to]}
                </span>
              ) : null}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Tools */}
      <div style={{ padding: "0 12px 12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "600", color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em", padding: "0 8px", marginBottom: "8px" }}>
          TOOLS
        </div>
        <NavLink
          to="/jd-analyzer"
          style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: "10px",
            padding: "9px 10px", borderRadius: "8px", textDecoration: "none",
            transition: "all 0.15s ease",
            background: isActive ? "rgba(167,139,250,0.14)" : "transparent",
            color: isActive ? "#ffffff" : "rgba(255,255,255,0.38)",
            borderLeft: isActive ? "2px solid #a78bfa" : "2px solid transparent",
          })}
          onMouseEnter={e => { if (!e.currentTarget.getAttribute("aria-current")) { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)" } }}
          onMouseLeave={e => { if (!e.currentTarget.getAttribute("aria-current")) { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.background = "transparent" } }}
        >
          <Sparkles size={16} strokeWidth={1.8} />
          <span style={{ fontSize: "13px", fontWeight: "500" }}>JD Analyzer</span>
        </NavLink>
      </div>

      {/* Bottom stats */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em" }}>
            OVERVIEW
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
          >
            <RefreshCw size={13} strokeWidth={2} style={{ transition: "transform 0.6s", transform: refreshing ? "rotate(360deg)" : "none" }} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { label: "Active",       value: stats.activeApplications, color: "#a78bfa" },
            { label: "Pending refs", value: stats.pendingReferrals,   color: "#f5a623" },
            { label: "Offers",       value: stats.offers,             color: "#3fb950" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.28)" }}>{label}</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  )
}
