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
      await _fetchAndSet()
    } catch (err) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // Silent reload — refreshes row indices in background without showing spinner
  async function _fetchAndSet() {
    const [apps, refs, ints, items] = await Promise.all([
      getSheetData(SHEETS.APPLICATIONS),
      getSheetData(SHEETS.REFERRALS),
      getSheetData(SHEETS.INTERVIEWS),
      getSheetData(SHEETS.ACTION_ITEMS),
    ])
    setApplications(apps)
    setReferrals(refs)
    setInterviews(ints)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
    setActionItems(
      (items || []).filter(item => {
        if (item.Dismissed === "true") return false
        if (item.Deadline) {
          const d = new Date(item.Deadline); d.setHours(0, 0, 0, 0)
          if (d < yesterday) return false
        }
        return true
      })
    )
  }

  // ── Applications CRUD ───────────────────────────────────────────
  async function addApplication(data) {
    const id = generateId()
    const today = new Date().toISOString().split("T")[0]
    const row = [
      id, data.company, data.role, data.source,
      data.dateApplied || today, data.status || "Applied",
      data.cvUsed || "", data.salaryExpected || "", data.notes || "", today
    ]
    // Optimistic: add with temp index, reload silently to get real index
    const tempItem = { _rowIndex: -1, ID: id, Company: data.company, Role: data.role,
      Source: data.source, "Date Applied": data.dateApplied || today,
      Status: data.status || "Applied", "CV Used": data.cvUsed || "",
      "Salary Expected": data.salaryExpected || "", Notes: data.notes || "" }
    setApplications(prev => [tempItem, ...prev])
    toast.success("Application added!")
    const success = await appendRow(SHEETS.APPLICATIONS, row)
    if (success) { _fetchAndSet() } else {
      setApplications(prev => prev.filter(a => a._rowIndex !== -1))
      toast.error("Failed to add — please try again")
    }
    return success
  }

  async function updateApplication(rowIndex, data) {
    const today = new Date().toISOString().split("T")[0]
    const row = [
      data.ID, data.Company, data.Role, data.Source, data["Date Applied"],
      data.Status, data["CV Used"], data["Salary Expected"], data.Notes, today
    ]
    // Optimistic: update local state immediately
    setApplications(prev => prev.map(a =>
      a._rowIndex === rowIndex ? { ...a, ...data, _rowIndex: rowIndex } : a
    ))
    toast.success("Application updated!")
    const success = await updateRow(SHEETS.APPLICATIONS, rowIndex, row)
    if (!success) {
      toast.error("Failed to save — refreshing")
      _fetchAndSet()
    }
    return success
  }

  async function deleteApplication(rowIndex) {
    // Optimistic: remove immediately
    const removed = applications.find(a => a._rowIndex === rowIndex)
    setApplications(prev => prev.filter(a => a._rowIndex !== rowIndex))
    toast.success("Application deleted")
    const success = await deleteRow(SHEETS.APPLICATIONS, rowIndex)
    if (success) {
      _fetchAndSet()  // silent reload to fix shifted row indices
    } else {
      setApplications(prev => [...prev, removed].sort((a, b) => a._rowIndex - b._rowIndex))
      toast.error("Failed to delete — restored")
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
      id, data.company, data.personName, data.personRole, data.platform,
      today, data.response || "Pending", data.referralGiven || "No",
      data.notes || "", followUpDate.toISOString().split("T")[0]
    ]
    const tempItem = { _rowIndex: -1, ID: id, Company: data.company,
      "Person Name": data.personName, "Person Role": data.personRole,
      Platform: data.platform, "Date Sent": today, Response: data.response || "Pending",
      "Referral Given": data.referralGiven || "No", Notes: data.notes || "" }
    setReferrals(prev => [tempItem, ...prev])
    toast.success("Referral logged!")
    const success = await appendRow(SHEETS.REFERRALS, row)
    if (success) { _fetchAndSet() } else {
      setReferrals(prev => prev.filter(r => r._rowIndex !== -1))
      toast.error("Failed to log — please try again")
    }
    return success
  }

  async function updateReferral(rowIndex, data) {
    const row = [
      data.ID, data.Company, data["Person Name"], data["Person Role"],
      data.Platform, data["Date Sent"], data.Response, data["Referral Given"],
      data.Notes, data["Follow Up Date"]
    ]
    setReferrals(prev => prev.map(r =>
      r._rowIndex === rowIndex ? { ...r, ...data, _rowIndex: rowIndex } : r
    ))
    toast.success("Referral updated!")
    const success = await updateRow(SHEETS.REFERRALS, rowIndex, row)
    if (!success) { toast.error("Failed to save — refreshing"); _fetchAndSet() }
    return success
  }

  async function deleteReferral(rowIndex) {
    const removed = referrals.find(r => r._rowIndex === rowIndex)
    setReferrals(prev => prev.filter(r => r._rowIndex !== rowIndex))
    toast.success("Referral deleted")
    const success = await deleteRow(SHEETS.REFERRALS, rowIndex)
    if (success) { _fetchAndSet() } else {
      setReferrals(prev => [...prev, removed].sort((a, b) => a._rowIndex - b._rowIndex))
      toast.error("Failed to delete — restored")
    }
    return success
  }

  // ── Interviews CRUD ─────────────────────────────────────────────
  async function addInterview(data) {
    const id = generateId()
    const row = [
      id, data.company, data.round, data.type, data.date,
      data.outcome || "Pending", data.notes || "", data.time || "", data.meetingLink || ""
    ]
    const tempItem = { _rowIndex: -1, ID: id, Company: data.company, Round: data.round,
      Type: data.type, Date: data.date, Outcome: data.outcome || "Pending",
      Notes: data.notes || "", Time: data.time || "", "Meeting Link": data.meetingLink || "" }
    setInterviews(prev => [tempItem, ...prev])
    toast.success("Interview logged!")
    const success = await appendRow(SHEETS.INTERVIEWS, row)
    if (success) { _fetchAndSet() } else {
      setInterviews(prev => prev.filter(i => i._rowIndex !== -1))
      toast.error("Failed to log — please try again")
    }
    return success
  }

  async function updateInterview(rowIndex, data) {
    const row = [
      data.ID, data.Company, data.Round, data.Type, data.Date,
      data.Outcome, data.Notes, data.Time || "", data["Meeting Link"] || ""
    ]
    setInterviews(prev => prev.map(i =>
      i._rowIndex === rowIndex ? { ...i, ...data, _rowIndex: rowIndex } : i
    ))
    toast.success("Interview updated!")
    const success = await updateRow(SHEETS.INTERVIEWS, rowIndex, row)
    if (!success) { toast.error("Failed to save — refreshing"); _fetchAndSet() }
    return success
  }

  async function deleteInterview(rowIndex) {
    const removed = interviews.find(i => i._rowIndex === rowIndex)
    setInterviews(prev => prev.filter(i => i._rowIndex !== rowIndex))
    toast.success("Interview deleted")
    const success = await deleteRow(SHEETS.INTERVIEWS, rowIndex)
    if (success) { _fetchAndSet() } else {
      setInterviews(prev => [...prev, removed].sort((a, b) => a._rowIndex - b._rowIndex))
      toast.error("Failed to delete — restored")
    }
    return success
  }

  // ── Action items ────────────────────────────────────────────────
  async function dismissActionItem(item) {
    // Optimistic: remove immediately
    setActionItems(prev => prev.filter(i => i._rowIndex !== item._rowIndex))
    toast.success("Marked as done!")
    const row = [
      item.ID, item.Type, item.Company, item.Role, item.Subject,
      item.Deadline, item.Link, item["Email Date"], "true", item["Message ID"],
    ]
    const success = await updateRow(SHEETS.ACTION_ITEMS, item._rowIndex, row)
    if (!success) {
      setActionItems(prev => [...prev, item])
      toast.error("Failed to sync — please try again")
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