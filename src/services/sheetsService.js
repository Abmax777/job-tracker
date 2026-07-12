const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID
const API_KEY = import.meta.env.VITE_SHEETS_API_KEY
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

// ── Read data from a sheet ────────────────────────────────────────
export async function getSheetData(sheetName) {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`
    const response = await fetch(url)
    const data = await response.json()

    if (!data.values || data.values.length < 2) return []

    const headers = data.values[0]
    const rows = data.values.slice(1)

    // Convert rows to objects using headers as keys
    return rows.map((row, index) => {
      const obj = { _rowIndex: index + 2 } // +2 because sheets is 1-indexed and row 1 is headers
      headers.forEach((header, i) => {
        obj[header] = row[i] || ''
      })
      return obj
    })
  } catch (err) {
    console.error(`Error reading ${sheetName}:`, err)
    return []
  }
}

// ── Add a new row ─────────────────────────────────────────────────
export async function appendRow(sheetName, rowData) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'append',
        sheet: sheetName,
        row: rowData
      })
    })
    const result = await response.json()
    return result.success
  } catch (err) {
    console.error(`Error appending to ${sheetName}:`, err)
    return false
  }
}

// ── Update an existing row ────────────────────────────────────────
export async function updateRow(sheetName, rowIndex, rowData) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'update',
        sheet: sheetName,
        row_index: rowIndex,
        row: rowData
      })
    })
    const result = await response.json()
    return result.success
  } catch (err) {
    console.error(`Error updating ${sheetName}:`, err)
    return false
  }
}

// ── Delete a row ──────────────────────────────────────────────────
export async function deleteRow(sheetName, rowIndex) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete',
        sheet: sheetName,
        row_index: rowIndex
      })
    })
    const result = await response.json()
    return result.success
  } catch (err) {
    console.error(`Error deleting from ${sheetName}:`, err)
    return false
  }
}

// ── Helper: generate a unique ID ──────────────────────────────────
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// ── Helper: format date for display ──────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// ── Helper: check if follow up is due ────────────────────────────
export function isFollowUpDue(dateStr, daysThreshold = 3) {
  if (!dateStr) return false
  const date = new Date(dateStr)
  const today = new Date()
  const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24))
  return diffDays >= daysThreshold
}

// ── Sheet names as constants ──────────────────────────────────────
export const SHEETS = {
  APPLICATIONS: 'Applications',
  REFERRALS: 'Referrals',
  INTERVIEWS: 'Interviews',
  ACTION_ITEMS: 'ActionItems',
}

// ── Status options ────────────────────────────────────────────────
export const APPLICATION_STATUSES = [
  'Applied',
  'Referral Pending',
  'In Review',
  'Interview Scheduled',
  'Offer',
  'Rejected',
  'Withdrawn'
]

export const REFERRAL_RESPONSES = [
  'Pending',
  'Agreed to Refer',
  'Declined',
  'No Response',
  'Connected'
]

export const INTERVIEW_TYPES = [
  'Phone Screen',
  'Technical Round',
  'System Design',
  'DSA/Coding',
  'HR Round',
  'Final Round'
]

export const SOURCES = [
  'LinkedIn',
  'Naukri',
  'Instahyre',
  'Company Website',
  'Referral',
  'Other'
]

export const CV_TYPES = [
  'Specialist (AOSP)',
  'General (Android)'
]