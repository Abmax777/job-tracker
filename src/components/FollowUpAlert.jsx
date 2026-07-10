import { useApp } from "../context/AppContext"
import { isFollowUpDue } from "../services/sheetsService"
import { useNavigate } from "react-router-dom"

export default function FollowUpAlert() {
  const { referrals } = useApp()
  const navigate = useNavigate()

  const overdueReferrals = referrals.filter(
    r => r.Response === "Pending" && isFollowUpDue(r["Date Sent"], 3)
  )

  if (overdueReferrals.length === 0) return null

  return (
    <div
      onClick={() => navigate("/referrals")}
      style={{
        background: "rgba(210,153,34,0.07)",
        backdropFilter: "blur(16px) saturate(150%)",
        WebkitBackdropFilter: "blur(16px) saturate(150%)",
        border: "1px solid rgba(210,153,34,0.22)",
        borderRadius: "10px",
        padding: "11px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(210,153,34,0.12)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(210,153,34,0.07)"}
    >
      <span style={{ fontSize: "13px", color: "#d29922", fontWeight: "600" }}>
        ⏰ {overdueReferrals.length} referral{overdueReferrals.length !== 1 ? "s" : ""} pending follow-up
      </span>
      <span style={{ fontSize: "12px", color: "#8b6914" }}>View Referrals →</span>
    </div>
  )
}
