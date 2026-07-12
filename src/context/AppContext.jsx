import { createContext, useContext, useEffect, useState } from "react"
import {
  getSheetData,
  appendRow,
  updateRow,
  deleteRow,
  generateId,
  SHEETS
} from "../services/sheetsService"
import toast from "react-hot-toast"

const AppContext = createContext()

export function AppProvider({ children }) {
  const [applications, setApplications] = useState([])
  const [referrals, setReferrals] = useState([])
  const [interviews, setInterviews] = useState([])
  const [actionItems, setActionItems] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Load all data on mount ──────────────────────────────────────
  useEffect(() => {
    loadAllData()
  }, [])

  async function loadAllData() {
    setLoading(true)
    try {
      const [apps, refs, ints, items] = await Promise.all([
        getSheetData(SHEETS.APPLICATIONS),
        getSheetData(SHEETS.REFERRALS),
        getSheetData(SHEETS.INTERVIEWS),
        getSheetData(SHEETS.ACTION_ITEMS),
      ])
      setApplications(apps)
      setReferrals(refs)
      setInterviews(ints)
      // Only show undismissed items; auto-hide if deadline passed > 1 day ago
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      setActionItems(
        (items || []).filter(item => {
          if (item.Dismissed === "true") return false
          if (item.Deadline) {
            const d = new Date(item.Deadline)
            d.setHours(0, 0, 0, 0)
            if (d < yesterday) return false  // expired > 1 day ago
          }
          return true
        })
      )
    } catch (err) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // ── Applications CRUD ───────────────────────────────────────────
  async function addApplication(data) {
    const id = generateId()
    const today = new Date().toISOString().split("T")[0]
    const row = [
      id,
      data.company,
      data.role,
      data.source,
      data.dateApplied || today,
      data.status || "Applied",
      data.cvUsed || "",
      data.salaryExpected || "",
      data.notes || "",
      today
    ]
    const success = await appendRow(SHEETS.APPLICATIONS, row)
    if (success) {
      await loadAllData()
      toast.success("Application added!")
    } else {
      toast.error("Failed to add application")
    }
    return success
  }

  async function updateApplication(rowIndex, data) {
    const today = new Date().toISOString().split("T")[0]
    const row = [
      data.ID,
      data.Company,
      data.Role,
      data.Source,
      data["Date Applied"],
      data.Status,
      data["CV Used"],
      data["Salary Expected"],
      data.Notes,
      today
    ]
    const success = await updateRow(SHEETS.APPLICATIONS, rowIndex, row)
    if (success) {
      await loadAllData()
      toast.success("Application updated!")
    } else {
      toast.error("Failed to update")
    }
    return success
  }

  async function deleteApplication(rowIndex) {
    const success = await deleteRow(SHEETS.APPLICATIONS, rowIndex)
    if (success) {
      await loadAllData()
      toast.success("Application deleted")
    } else {
      toast.error("Failed to delete")
    }
    return success
  }

  // ── Referrals CRUD ──────────────────────────────────────────────
  async function addReferral(data) {
    const id = generateId()
    const today = new Date().toISOString().split("T")[0]
    const followUpDate = new Date()
    followUpDate.setDate(followUpDate.getDate() + 3)
    const row = [
      id,
      data.company,
      data.personName,
      data.personRole,
      data.platform,
      today,
      data.response || "Pending",
      data.referralGiven || "No",
      data.notes || "",
      followUpDate.toISOString().split("T")[0]
    ]
    const success = await appendRow(SHEETS.REFERRALS, row)
    if (success) {
      await loadAllData()
      toast.success("Referral logged!")
    } else {
      toast.error("Failed to log referral")
    }
    return success
  }

  async function updateReferral(rowIndex, data) {
    const row = [
      data.ID,
      data.Company,
      data["Person Name"],
      data["Person Role"],
      data.Platform,
      data["Date Sent"],
      data.Response,
      data["Referral Given"],
      data.Notes,
      data["Follow Up Date"]
    ]
    const success = await updateRow(SHEETS.REFERRALS, rowIndex, row)
    if (success) {
      await loadAllData()
      toast.success("Referral updated!")
    } else {
      toast.error("Failed to update")
    }
    return success
  }

  async function deleteReferral(rowIndex) {
    const success = await deleteRow(SHEETS.REFERRALS, rowIndex)
    if (success) {
      await loadAllData()
      toast.success("Referral deleted")
    } else {
      toast.error("Failed to delete")
    }
    return success
  }

  // ── Interviews CRUD ─────────────────────────────────────────────
  async function addInterview(data) {
    const id = generateId()
    const row = [
      id,
      data.company,
      data.round,
      data.type,
      data.date,
      data.outcome || "Pending",
      data.notes || "",
      data.time || "",
      data.meetingLink || ""
    ]
    const success = await appendRow(SHEETS.INTERVIEWS, row)
    if (success) {
      await loadAllData()
      toast.success("Interview logged!")
    } else {
      toast.error("Failed to log interview")
    }
    return success
  }

  async function updateInterview(rowIndex, data) {
    const row = [
      data.ID,
      data.Company,
      data.Round,
      data.Type,
      data.Date,
      data.Outcome,
      data.Notes,
      data.Time || "",
      data["Meeting Link"] || ""
    ]
    const success = await updateRow(SHEETS.INTERVIEWS, rowIndex, row)
    if (success) {
      await loadAllData()
      toast.success("Interview updated!")
    } else {
      toast.error("Failed to update")
    }
    return success
  }

  async function deleteInterview(rowIndex) {
    const success = await deleteRow(SHEETS.INTERVIEWS, rowIndex)
    if (success) {
      await loadAllData()
      toast.success("Interview deleted")
    } else {
      toast.error("Failed to delete")
    }
    return success
  }

  // ── Action items ────────────────────────────────────────────────
  async function dismissActionItem(item) {
    // Reconstruct the full row with Dismissed = "true" (column order matches sheet headers)
    const row = [
      item.ID,
      item.Type,
      item.Company,
      item.Role,
      item.Subject,
      item.Deadline,
      item.Link,
      item["Email Date"],
      "true",               // Dismissed
      item["Message ID"],
    ]
    const success = await updateRow(SHEETS.ACTION_ITEMS, item._rowIndex, row)
    if (success) {
      setActionItems(prev => prev.filter(i => i._rowIndex !== item._rowIndex))
      toast.success("Marked as done!")
    } else {
      toast.error("Failed to dismiss item")
    }
  }

  // ── Computed stats for dashboard ────────────────────────────────
  const stats = {
    totalApplications: applications.length,
    totalReferrals: referrals.length,
    totalInterviews: interviews.length,
    pendingReferrals: referrals.filter(r => r.Response === "Pending").length,
    activeApplications: applications.filter(
      a => !["Rejected", "Withdrawn", "Offer"].includes(a.Status)
    ).length,
    offers: applications.filter(a => a.Status === "Offer").length,
    interviews: applications.filter(a => a.Status === "Interview Scheduled").length,
  }

  return (
    <AppContext.Provider value={{
      applications,
      referrals,
      interviews,
      actionItems,
      loading,
      stats,
      loadAllData,
      addApplication,
      updateApplication,
      deleteApplication,
      addReferral,
      updateReferral,
      deleteReferral,
      addInterview,
      updateInterview,
      deleteInterview,
      dismissActionItem,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}