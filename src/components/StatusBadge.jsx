const STATUS_STYLES = {
  "Applied":               { bg: "rgba(88, 166, 255, 0.12)",  color: "#58a6ff"  },
  "Referral Pending":      { bg: "rgba(210, 153, 34, 0.12)",  color: "#d29922"  },
  "In Review":             { bg: "rgba(188, 140, 255, 0.12)", color: "#bc8cff"  },
  "Interview Scheduled":   { bg: "rgba(63, 185, 80, 0.12)",   color: "#3fb950"  },
  "Offer":                 { bg: "rgba(63, 185, 80, 0.2)",    color: "#3fb950"  },
  "Rejected":              { bg: "rgba(248, 81, 73, 0.12)",   color: "#f85149"  },
  "Withdrawn":             { bg: "rgba(139, 148, 158, 0.12)", color: "#8b949e"  },
  "Pending":               { bg: "rgba(210, 153, 34, 0.12)",  color: "#d29922"  },
  "Agreed to Refer":       { bg: "rgba(63, 185, 80, 0.12)",   color: "#3fb950"  },
  "Declined":              { bg: "rgba(248, 81, 73, 0.12)",   color: "#f85149"  },
  "No Response":           { bg: "rgba(139, 148, 158, 0.12)", color: "#8b949e"  },
  "Connected":             { bg: "rgba(88, 166, 255, 0.12)",  color: "#58a6ff"  },
  "Passed":                { bg: "rgba(63, 185, 80, 0.12)",   color: "#3fb950"  },
  "Failed":                { bg: "rgba(248, 81, 73, 0.12)",   color: "#f85149"  },
  "Cancelled":             { bg: "rgba(139, 148, 158, 0.12)", color: "#8b949e"  },
  "Rescheduled":           { bg: "rgba(210, 153, 34, 0.12)",  color: "#d29922"  },
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { bg: "rgba(139,148,158,0.12)", color: "#8b949e" }
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: style.bg, color: style.color }}
    >
      {status || "--"}
    </span>
  )
}