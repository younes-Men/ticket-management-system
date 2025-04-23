import React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import Layout from "../../components/Layout"
import { Link } from "react-router-dom"

const CollaboratorDashboard = () => {
  const [assignedTickets, setAssignedTickets] = useState([])
  const [ticketStats, setTicketStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/collaborator/tickets")
        setAssignedTickets(res.data)

        // Calculate ticket statistics
        const stats = {
          total: res.data.length,
          open: res.data.filter((ticket) => ticket.etat === "ouvert").length,
          inProgress: res.data.filter((ticket) => ticket.etat === "en_cours").length,
          closed: res.data.filter((ticket) => ticket.etat === "ferme").length,
        }
        setTicketStats(stats)
      } catch (err) {
        setError("Erreur lors du chargement des tickets")
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
            <p className="text-slate-600 font-medium">Chargement des tickets...</p>
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
        <h1 className="text-3xl font-bold text-slate-800">Tableau de bord collaborateur</h1>
        <p className="text-slate-500 mt-1">Gérez vos tickets assignés</p>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-teal-500 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Tickets</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{ticketStats.total}</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-teal-600"
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
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-amber-500 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Tickets Ouverts</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{ticketStats.open}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-amber-600"
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
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">En Cours</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{ticketStats.inProgress}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-emerald-500 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Tickets Fermés</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{ticketStats.closed}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {ticketStats.open > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
            <div className="bg-amber-500 text-white p-4">
              <h2 className="text-lg font-semibold flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
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
                À traiter ({ticketStats.open})
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {assignedTickets
                .filter((ticket) => ticket.etat === "ouvert")
                .map((ticket) => (
                  <Link
                    key={ticket._id}
                    to={`/tickets/${ticket._id}`}
                    className="block p-4 hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-slate-800">#{ticket._id.substring(0, 8)}</h3>
                        <p className="text-sm text-slate-500 mt-1">{ticket.client.nom}</p>
                        <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">
                          {ticket.observation.substring(0, 50)}...
                        </p>
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
                  </Link>
                ))}
            </div>
          </div>
        )}

        {ticketStats.inProgress > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
            <div className="bg-blue-500 text-white p-4">
              <h2 className="text-lg font-semibold flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                En cours ({ticketStats.inProgress})
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {assignedTickets
                .filter((ticket) => ticket.etat === "en_cours")
                .map((ticket) => (
                  <Link
                    key={ticket._id}
                    to={`/tickets/${ticket._id}`}
                    className="block p-4 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-slate-800">#{ticket._id.substring(0, 8)}</h3>
                        <p className="text-sm text-slate-500 mt-1">{ticket.client.nom}</p>
                        <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">
                          {ticket.observation.substring(0, 50)}...
                        </p>
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
                  </Link>
                ))}
            </div>
          </div>
        )}

        {ticketStats.closed > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
            <div className="bg-emerald-500 text-white p-4">
              <h2 className="text-lg font-semibold flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Résolus ({ticketStats.closed})
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {assignedTickets
                .filter((ticket) => ticket.etat === "ferme")
                .map((ticket) => (
                  <Link
                    key={ticket._id}
                    to={`/tickets/${ticket._id}`}
                    className="block p-4 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-slate-800">#{ticket._id.substring(0, 8)}</h3>
                        <p className="text-sm text-slate-500 mt-1">{ticket.client.nom}</p>
                        <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">
                          {ticket.observation.substring(0, 50)}...
                        </p>
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
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* All Assigned Tickets */}
      <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
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
            Tous les tickets assignés
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm">
                <th className="py-3 px-4 text-left font-medium">ID</th>
                <th className="py-3 px-4 text-left font-medium">Client</th>
                <th className="py-3 px-4 text-left font-medium">Problème</th>
                <th className="py-3 px-4 text-left font-medium">État</th>
                <th className="py-3 px-4 text-left font-medium">Date</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedTickets.length > 0 ? (
                assignedTickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 font-medium text-slate-700">{ticket._id.substring(0, 8)}</td>
                    <td className="py-3 px-4 text-slate-600">{ticket.client.nom}</td>
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
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
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p>Aucun ticket assigné</p>
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

export default CollaboratorDashboard
