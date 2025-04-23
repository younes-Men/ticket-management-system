"use client"
import React from "react"
import Sidebar from "./Sidebar"
import { useAuth } from "../context/AuthContext"

const Layout = ({ children }) => {
  const { user } = useAuth()

  if (!user) {
    return <div>{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">{children}</div>
    </div>
  )
}

export default Layout
