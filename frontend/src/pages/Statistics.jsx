import React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import Layout from "../components/Layout"

const Statistics = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState("month")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/api/admin/statistics?period=${period}`)
        setStats(res.data)
      } catch (err) {
        setError("Erreur lors du chargement des statistiques")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [period])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-teal-500 animate-pulse"></div>
            <div className="w-4 h-4 rounded-full bg-teal-500 animate-pulse delay-75"></div>
            <div className="w-4 h-4 rounded-full bg-teal-500 animate-pulse delay-150"></div>
            <p className="text-slate-600 font-medium">Chargement des statistiques...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg mb-6 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Statistiques</h1>
        <p className="text-slate-500 mt-1">Analyse des performances et des tendances</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8 border border-slate-100">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setPeriod("week")}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              period === "week"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Cette semaine
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              period === "month"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Ce mois
          </button>
          <button
            onClick={() => setPeriod("year")}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              period === "year"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Cette année
          </button>
          <button
            onClick={() => setPeriod("all")}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              period === "all" ? "bg-teal-600 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Tout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Ticket Overview */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <h2 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Aperçu des tickets
          </h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-5 rounded-xl shadow-sm text-white text-center">
              <p className="text-4xl font-bold mb-1">{stats?.totalTickets}</p>
              <p className="text-teal-100">Total</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-5 rounded-xl shadow-sm text-white text-center">
              <p className="text-4xl font-bold mb-1">{stats?.openTickets}</p>
              <p className="text-amber-100">Ouverts</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-xl shadow-sm text-white text-center">
              <p className="text-4xl font-bold mb-1">{stats?.closedTickets}</p>
              <p className="text-emerald-100">Fermés</p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">Temps de résolution moyen</h3>
              <div className="bg-teal-100 px-3 py-1 rounded-full text-teal-800 text-sm font-medium">
                {stats?.avgResolutionTime} heures
              </div>
            </div>
            <div className="mt-4 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full"
                style={{ width: `${Math.min(100, (stats?.avgResolutionTime / 24) * 100)}%` }}
              ></div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>0h</span>
              <span>12h</span>
              <span>24h</span>
              <span>36h+</span>
            </div>
          </div>
        </div>

        {/* Ticket Types */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <h2 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Répartition par type
          </h2>
          <div className="space-y-5">
            {stats?.ticketsByType.map((type) => (
              <div key={type.name}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-slate-700">{type.name}</span>
                  <div className="flex items-center">
                    <span className="text-slate-500 mr-2">{type.count}</span>
                    <span className="bg-teal-100 px-2 py-0.5 rounded text-teal-800 text-xs font-medium">
                      {type.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${type.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Collaborateurs */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <h2 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Top collaborateurs
          </h2>
          <div className="space-y-4">
            {stats?.topCollaborateurs.map((collab, index) => (
              <div
                key={collab._id}
                className="flex items-center bg-slate-50 p-4 rounded-xl hover:bg-slate-100 transition-colors duration-200"
              >
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-sm">
                  {index + 1}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-slate-800">
                      {collab.nom} {collab.prenom}
                    </p>
                    <div className="bg-teal-100 px-3 py-1 rounded-full text-teal-800 text-sm font-medium">
                      {collab.ticketsCount} tickets
                    </div>
                  </div>
                  <div className="mt-2 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full"
                      style={{ 
                        width: `${(collab.ticketsCount / stats.topCollaborateurs[0].ticketsCount) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}

export default Statistics
