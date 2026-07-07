import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AppProvider } from "./context/AppContext"
import Sidebar from "./components/Navbar"
import Dashboard from "./pages/Dashboard"
import Applications from "./pages/Applications"
import Referrals from "./pages/Referrals"
import Interviews from "./pages/Interviews"
import { useIsMobile } from "./hooks/useIsMobile"

function Layout({ children }) {
  const isMobile = useIsMobile()
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#141414" }}>
      <Sidebar />
      <main style={{
        marginLeft: isMobile ? "0" : "224px",
        padding: isMobile ? "16px 14px" : "24px",
        paddingBottom: isMobile ? "76px" : "24px",
        flex: 1,
        minWidth: 0,
      }}>
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.DEV ? "/" : "/job-tracker/"}>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/interviews" element={<Interviews />} />
          </Routes>
        </Layout>
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
