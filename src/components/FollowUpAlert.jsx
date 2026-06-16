import { useApp } from "../context/AppContext"
import { isFollowUpDue, formatDate } from "../services/sheetsService"

export default function FollowUpAlert() {
  const { referrals, applications } = useApp()

  const overdueReferrals = referrals.filter(
    r => r.Response === "Pending" && isFollowUpDue(r["Date Sent"], 3)
  )

  const staleApplications = applications.filter(
    a => !["Rejected", "Withdrawn", "Offer"].includes(a.Status)
      && isFollowUpDue(a["Date Applied"], 7)
  )

  if (overdueReferrals.length === 0 && staleApplications.length === 0) return null

  return (
    <div className="space-y-3 mb-6">
      {overdueReferrals.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "rgba(210,153,34,0.08)", border: "1px solid rgba(210,153,34,0.25)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold" style={{ color: "#d29922" }}>
              ⏰ {overdueReferrals.length} referral{overdueReferrals.length > 1 ? "s" : ""} need follow-up
            </span>
          </div>
          <div className="space-y-1">
            {overdueReferrals.map((r, i) => (
              <p key={i} className="text-sm" style={{ color: "#8b949e" }}>
                • <span style={{ color: "#e6edf3" }}>{r.Company}</span> — messaged {r["Person Name"]} on {formatDate(r["Date Sent"])}
              </p>
            ))}
          </div>
        </div>
      )}

      {staleApplications.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "rgba(88,166,255,0.08)", border: "1px solid rgba(88,166,255,0.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold" style={{ color: "#58a6ff" }}>
              📋 {staleApplications.length} application{staleApplications.length > 1 ? "s" : ""} with no update in 7+ days
            </span>
          </div>
          <div className="space-y-1">
            {staleApplications.map((a, i) => (
              <p key={i} className="text-sm" style={{ color: "#8b949e" }}>
                • <span style={{ color: "#e6edf3" }}>{a.Company}</span> — {a.Role} — applied {formatDate(a["Date Applied"])}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}