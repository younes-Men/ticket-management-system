import React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import Layout from "../../components/Layout"
import { Link } from "react-router-dom"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    totalClients: 0,
    totalDemandeurs: 0,
    totalCollaborateurs: 0,
  })
  const [recentTickets, setRecentTickets] = useState([])
  const [recentClients, setRecentClients] = useState([])
  const [recentDemandeurs, setRecentDemandeurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ticketsRes, clientsRes, demandeursRes] = await Promise.all([
          axios.get("/api/admin/statistics"),
          axios.get("/api/tickets/recent"),
          axios.get("/api/clients?limit=5"),
          axios.get("/api/demandeurs?limit=5"),
        ])

        setStats(statsRes.data)
        setRecentTickets(ticketsRes.data)
        setRecentClients(clientsRes.data)
        setRecentDemandeurs(demandeursRes.data)
      } catch (err) {
        setError("Erreur lors du chargement des données")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-teal-500 animate-pulse"></div>
            <div className="w-4 h-4 rounded-full bg-teal-500 animate-pulse delay-75"></div>
            <div className="w-4 h-4 rounded-full bg-teal-500 animate-pulse delay-150"></div>
            <p className="text-slate-600 font-medium">Chargement des données...</p>
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
        <h1 className="text-3xl font-bold text-slate-800">Tableau de bord administrateur</h1>
        <p className="text-slate-500 mt-1">Bienvenue dans votre espace d'administration</p>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-4 -mr-16 opacity-30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-32 w-32"
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
          </div>
          <h2 className="text-lg font-semibold mb-1">Total Tickets</h2>
          <div className="flex items-baseline">
            <p className="text-4xl font-bold">{stats.totalTickets}</p>
            <div className="ml-4 flex flex-col">
              <span className="bg-teal-400 bg-opacity-30 text-white px-2 py-0.5 rounded text-xs">
                {stats.openTickets} ouverts
              </span>
              <span className="bg-teal-400 bg-opacity-30 text-white px-2 py-0.5 rounded text-xs mt-1">
                {stats.closedTickets} fermés
              </span>
            </div>
          </div>
          <Link
            to="/tickets"
            className="mt-4 inline-flex items-center text-sm bg-white text-teal-700 hover:bg-opacity-90 rounded-lg px-3 py-1.5 transition-all duration-200"
          >
            Voir détails
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-4 -mr-16 opacity-30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-32 w-32"
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
          </div>
          <h2 className="text-lg font-semibold mb-1">Clients</h2>
          <p className="text-4xl font-bold">{stats.totalClients}</p>
          <Link
            to="/clients"
            className="mt-4 inline-flex items-center text-sm bg-white text-emerald-700 hover:bg-opacity-90 rounded-lg px-3 py-1.5 transition-all duration-200"
          >
            Gérer les clients
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-4 -mr-16 opacity-30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-32 w-32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-1">Demandeurs</h2>
          <p className="text-4xl font-bold">{stats.totalDemandeurs}</p>
          <Link
            to="/demandeurs"
            className="mt-4 inline-flex items-center text-sm bg-white text-amber-700 hover:bg-opacity-90 rounded-lg px-3 py-1.5 transition-all duration-200"
          >
            Voir demandeurs
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-4 -mr-16 opacity-30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-32 w-32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-1">Collaborateurs</h2>
          <p className="text-4xl font-bold">{stats.totalCollaborateurs}</p>
          <Link
            to="/admin/users"
            className="mt-4 inline-flex items-center text-sm bg-white text-purple-700 hover:bg-opacity-90 rounded-lg px-3 py-1.5 transition-all duration-200"
          >
            Gérer utilisateurs
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Actions rapides</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Link
            to="/tickets/create"
            className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-200 border border-slate-100"
          >
            <div className="bg-teal-100 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">Nouveau ticket</span>
          </Link>

          <Link
            to="/clients/create"
            className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-200 border border-slate-100"
          >
            <div className="bg-emerald-100 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">Nouveau client</span>
          </Link>

          <Link
            to="/demandeurs/create"
            className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-200 border border-slate-100"
          >
            <div className="bg-amber-100 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">Nouveau demandeur</span>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-200 border border-slate-100"
          >
            <div className="bg-purple-100 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
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
            </div>
            <span className="text-sm font-medium text-slate-700">Gérer utilisateurs</span>
          </Link>

          <Link
            to="/statistics"
            className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-200 border border-slate-100"
          >
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">Statistiques</span>
          </Link>
        </div>
      </div>

    
      {/* Recent Tickets */}
      <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center">
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
            Tickets récents
          </h2>
          <Link
            to="/tickets"
            className="text-teal-600 hover:text-teal-800 transition-colors font-medium flex items-center"
          >
            Voir tous
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm">
                <th className="py-3 px-4 text-left font-medium">ID</th>
                <th className="py-3 px-4 text-left font-medium">Client</th>
                <th className="py-3 px-4 text-left font-medium">Demandeur</th>
                <th className="py-3 px-4 text-left font-medium">Problème</th>
                <th className="py-3 px-4 text-left font-medium">État</th>
                <th className="py-3 px-4 text-left font-medium">Date</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.length > 0 ? (
                recentTickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 font-medium text-slate-700">{ticket._id.substring(0, 8)}</td>
                    <td className="py-3 px-4 text-slate-600">{ticket.client.nom}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {ticket.demandeur.nom} {ticket.demandeur.prenom}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{ticket.observation.substring(0, 30)}...</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.etat === "ouvert"
                            ? "bg-amber-100 text-amber-800"
                            : ticket.etat === "en_cours"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {ticket.etat === "ouvert" ? "Ouvert" : ticket.etat === "en_cours" ? "En cours" : "Fermé"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{new Date(ticket.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/tickets/${ticket._id}`}
                        className="text-teal-600 hover:text-teal-800 transition-colors font-medium text-sm flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-slate-300 mb-2"
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
                      <p>Aucun ticket récent</p>
                      <Link
                        to="/tickets/create"
                        className="mt-2 inline-block bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Créer un ticket
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard
