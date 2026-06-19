const STATUS_STYLES = {
  "Applied":               { color: "#58a6ff", bg: "rgba(88,166,255,0.08)"   },
  "Referral Pending":      { color: "#f5a623", bg: "rgba(245,166,35,0.08)"   },
  "In Review":             { color: "#bc8cff", bg: "rgba(188,140,255,0.08)"  },
  "Interview Scheduled":   { color: "#3fb950", bg: "rgba(63,185,80,0.08)"    },
  "Offer":                 { color: "#3fb950", bg: "rgba(63,185,80,0.12)"    },
  "Rejected":              { color: "#f85149", bg: "rgba(248,81,73,0.08)"    },
  "Withdrawn":             { color: "#555",    bg: "rgba(255,255,255,0.04)"  },
  "Pending":               { color: "#f5a623", bg: "rgba(245,166,35,0.08)"   },
  "Agreed to Refer":       { color: "#3fb950", bg: "rgba(63,185,80,0.08)"    },
  "Declined":              { color: "#f85149", bg: "rgba(248,81,73,0.08)"    },
  "No Response":           { color: "#555",    bg: "rgba(255,255,255,0.04)"  },
  "Connected":             { color: "#58a6ff", bg: "rgba(88,166,255,0.08)"   },
  "Passed":                { color: "#3fb950", bg: "rgba(63,185,80,0.08)"    },
  "Failed":                { color: "#f85149", bg: "rgba(248,81,73,0.08)"    },
  "Cancelled":             { color: "#555",    bg: "rgba(255,255,255,0.04)"  },
  "Rescheduled":           { color: "#f5a623", bg: "rgba(245,166,35,0.08)"   },
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { color: "#555", bg: "rgba(255,255,255,0.04)" }
  return (
    <span style={{
      padding: "3px 10px", borderRadius: "999px",
      fontSize: "11px", fontWeight: "600",
      color: style.color, background: style.bg,
      whiteSpace: "nowrap"
    }}>
      {status || "--"}
    </span>
  )
}