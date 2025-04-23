import React from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { useAuth } from "../context/AuthContext"

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin")
      } else if (user.role === "assistant") {
        navigate("/assistant")
      } else if (user.role === "collaborator") {
        navigate("/collaborator")
      }
    }
  }, [user, navigate])

  return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-4 h-4 rounded-full bg-teal-500 animate-pulse"></div>
            <div className="w-4 h-4 rounded-full bg-teal-500 animate-pulse delay-75"></div>
            <div className="w-4 h-4 rounded-full bg-teal-500 animate-pulse delay-150"></div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Chargement du tableau de bord...</h1>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
