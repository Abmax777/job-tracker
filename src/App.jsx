import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AppProvider } from "./context/AppContext"
import Sidebar from "./components/Navbar"
import Dashboard from "./pages/Dashboard"
import Applications from "./pages/Applications"
import Referrals from "./pages/Referrals"
import Interviews from "./pages/Interviews"

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.DEV ? "/" : "/job-tracker/"}>
        <div className="flex min-h-screen" style={{ background: "#141414" }}>
          <Sidebar />
          <main style={{ marginLeft: "224px", padding: "24px", flex: 1 }}>
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/interviews" element={<Interviews />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#161b22",
              color: "#e6edf3",
              border: "1px solid #21262d",
              borderRadius: "10px",
              fontSize: "13px"
            },
            success: { iconTheme: { primary: "#3fb950", secondary: "#161b22" } },
            error: { iconTheme: { primary: "#f85149", secondary: "#161b22" } },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  )
}