"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import AdminDashboard from "./pages/admin/Dashboard"
import AssistantDashboard from "./pages/assistant/Dashboard"
import CollaboratorDashboard from "./pages/collaborator/Dashboard"
import Clients from "./pages/Clients"
import Demandeurs from "./pages/Demandeurs"
import Tickets from "./pages/Tickets"
import TicketDetails from "./pages/TicketDetails"
import CreateTicket from "./pages/CreateTicket"
import CreateClient from "./pages/CreateClient"
import CreateDemandeur from "./pages/CreateDemandeur"
import ManageUsers from "./pages/admin/ManageUsers"
import Statistics from "./pages/Statistics"
import NotFound from "./pages/NotFound"
import React from "react"

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assistant"
            element={
              <ProtectedRoute allowedRoles={["admin", "assistant"]}>
                <AssistantDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/collaborator"
            element={
              <ProtectedRoute allowedRoles={["admin", "collaborator"]}>
                <CollaboratorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients"
            element={
              <ProtectedRoute allowedRoles={["admin", "assistant"]}>
                <Clients />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients/create"
            element={
              <ProtectedRoute allowedRoles={["admin", "assistant"]}>
                <CreateClient />
              </ProtectedRoute>
            }
          />

          <Route
            path="/demandeurs"
            element={
              <ProtectedRoute allowedRoles={["admin", "assistant"]}>
                <Demandeurs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/demandeurs/create"
            element={
              <ProtectedRoute allowedRoles={["admin", "assistant"]}>
                <CreateDemandeur />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tickets/create"
            element={
              <ProtectedRoute allowedRoles={["admin", "assistant"]}>
                <CreateTicket />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/statistics"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Statistics />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
