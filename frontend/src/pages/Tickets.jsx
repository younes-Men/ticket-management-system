import React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import Layout from "../components/Layout"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Tickets = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const { user } = useAuth()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        let url = "/api/tickets"

        if (user.role === "collaborator") {
          url = "/api/collaborator/tickets"
        }

        const res = await axios.get(url)
        setTickets(res.data)
      } catch (err) {
        setError("Erreur lors du chargement des tickets")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [user])

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "all") return true
    return ticket.etat === filter
  })

  // Nouvelles fonctions pour la suppression
  const handleOpenDeleteModal = (ticket) => {
    setTicketToDelete(ticket)
    setIsDeleteModalOpen(true)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setTicketToDelete(null)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!ticketToDelete) return

    try {
      setIsDeleting(true)
      setDeleteError(null)

      await axios.delete(`/api/tickets/${ticketToDelete._id}`)

      // Supprimer le ticket de la liste
      setTickets(tickets.filter((t) => t._id !== ticketToDelete._id))

      handleCloseDeleteModal()
    } catch (err) {
      console.error("Error deleting ticket:", err)
      setDeleteError(err.response?.data?.message || "Erreur lors de la suppression du ticket.")
    } finally {
      setIsDeleting(false)
    }
  }

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Tickets</h1>

        {(user.role === "admin" || user.role === "assistant") && (
          <Link
            to="/tickets/create"
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouveau Ticket
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === "all" ? "bg-slate-800 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter("ouvert")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === "ouvert"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 hover:bg-amber-100 text-amber-700"
            }`}
          >
            Ouverts
          </button>
          <button
            onClick={() => setFilter("en_cours")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === "en_cours" ? "bg-teal-600 text-white shadow-sm" : "bg-teal-50 hover:bg-teal-100 text-teal-700"
            }`}
          >
            En cours
          </button>
          <button
            onClick={() => setFilter("ferme")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === "ferme"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
            }`}
          >
            Fermés
          </button>
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
              {filteredTickets.map((ticket) => (
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
                    <div className="flex space-x-2">
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
                      {(user.role === "admin" || user.role === "assistant") && (
                        <>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => handleOpenDeleteModal(ticket)}
                            className="text-red-600 hover:text-red-800 transition-colors font-medium text-sm flex items-center"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-slate-300 mb-2"
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
                      Aucun ticket trouvé
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && ticketToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Confirmer la suppression</h2>
                <button
                  onClick={handleCloseDeleteModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
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
                  {deleteError}
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center justify-center mb-4 text-red-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <p className="text-center text-slate-700">
                  Êtes-vous sûr de vouloir supprimer le ticket{" "}
                  <span className="font-semibold">#{ticketToDelete._id.substring(0, 8)}</span>?
                </p>
                <p className="text-center text-slate-500 text-sm mt-2">
                  Cette action est irréversible et supprimera définitivement ce ticket.
                </p>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-lg transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    "Supprimer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Tickets
