import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AppProvider } from "./context/AppContext"
import Sidebar from "./components/Navbar"
import Dashboard from "./pages/Dashboard"
import Applications from "./pages/Applications"
import Referrals from "./pages/Referrals"
import Interviews from "./pages/Interviews"
import JDAnalyzer from "./pages/JDAnalyzer"
import { useIsMobile } from "./hooks/useIsMobile"

function Layout({ children }) {
  const isMobile = useIsMobile()
  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {/* Animated mesh background */}
      <div className="mesh-bg">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
        <div className="mesh-blob mesh-blob-3" />
        <div className="mesh-blob mesh-blob-4" />
        <div className="mesh-blob mesh-blob-5" />
      </div>

      <Sidebar />
      <main style={{
        marginLeft: isMobile ? "0" : "224px",
        padding: isMobile ? "16px 14px" : "24px",
        paddingBottom: isMobile ? "76px" : "24px",
        flex: 1,
        minWidth: 0,
        position: "relative",
        zIndex: 1,
      }}>
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/">
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/jd-analyzer" element={<JDAnalyzer />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "rgba(20,20,40,0.85)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              color: "#e6edf3",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              fontSize: "13px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            },
            success: { iconTheme: { primary: "#3fb950", secondary: "#161b22" } },
            error: { iconTheme: { primary: "#f85149", secondary: "#161b22" } },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  )
}
