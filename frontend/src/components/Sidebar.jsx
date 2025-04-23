"use client"
import React from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"

const Sidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (path) => {
    return location.pathname === path
  }

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-2.5 rounded-lg text-sm transition-colors ${
        isActive(to) ? "bg-teal-700 text-white font-medium" : "text-white hover:bg-teal-600"
      }`}
    >
      {children}
    </Link>
  )

  const NavSection = ({ title, children }) => (
    <div className="mb-6">
      {title && <h3 className="px-4 mb-2 text-xs font-semibold text-teal-200 uppercase tracking-wider">{title}</h3>}
      <ul className="space-y-1">{children}</ul>
    </div>
  )

  return (
    <div
      className={`bg-teal-700 border-r border-teal-800 transition-all duration-300 ${collapsed ? "w-20" : "w-64"} flex flex-col`}
    >
      <div className="p-4 border-b border-teal-800 flex items-center justify-between">
        {!collapsed && <h2 className="text-lg font-semibold text-white">Ticket Manager</h2>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-md hover:bg-teal-600 text-white">
          {collapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="11 17 6 12 11 7"></polyline>
              <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 border-b border-teal-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-700 font-semibold">
              {user?.nom?.charAt(0)}
              {user?.prenom?.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-white">
                {user?.nom} {user?.prenom}
              </div>
              <div className="text-xs text-teal-200">
                {user?.role === "admin" && "Administrateur"}
                {user?.role === "assistant" && "Assistant"}
                {user?.role === "collaborator" && "Collaborateur"}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <NavSection>
          <li>
            <NavLink to="/dashboard">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              {!collapsed && <span>Tableau de bord</span>}
            </NavLink>
          </li>
        </NavSection>

        {(user?.role === "admin" || user?.role === "assistant") && (
          <NavSection title={!collapsed && "Clients"}>
            <li>
              <NavLink to="/clients">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {!collapsed && <span>Clients</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/clients/create">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                {!collapsed && <span>Nouveau Client</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/demandeurs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {!collapsed && <span>Demandeurs</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/demandeurs/create">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                {!collapsed && <span>Nouveau Demandeur</span>}
              </NavLink>
            </li>
          </NavSection>
        )}

        <NavSection title={!collapsed && "Tickets"}>
          <li>
            <NavLink to="/tickets">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              {!collapsed && <span>Tickets</span>}
            </NavLink>
          </li>
          {(user?.role === "admin" || user?.role === "assistant") && (
            <li>
              <NavLink to="/tickets/create">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                {!collapsed && <span>Nouveau Ticket</span>}
              </NavLink>
            </li>
          )}
        </NavSection>

        {user?.role === "admin" && (
          <NavSection title={!collapsed && "Administration"}>
            <li>
              <NavLink to="/admin/users">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {!collapsed && <span>Gestion Utilisateurs</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/statistics">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                {!collapsed && <span>Statistiques</span>}
              </NavLink>
            </li>
          </NavSection>
        )}
      </div>

      <div className="p-4 border-t border-teal-800">
        <button
          onClick={logout}
          className={`w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${collapsed ? "p-2" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          {!collapsed && <span className="ml-2">Déconnexion</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
