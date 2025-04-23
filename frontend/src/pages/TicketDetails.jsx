import React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { useAuth } from "../context/AuthContext"

const TicketDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [comment, setComment] = useState("")
  const [collaborateurs, setCollaborateurs] = useState([])
  const [selectedCollaborateur, setSelectedCollaborateur] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching ticket details for ID:", id)
        console.log("Current user role:", user.role)

        // Different API endpoints based on user role
        let ticketEndpoint = `/api/tickets/${id}`
        if (user.role === "collaborator") {
          ticketEndpoint = `/api/collaborator/tickets/${id}`
        }

        console.log("Using endpoint:", ticketEndpoint)

        // For admin and assistant, also fetch collaborateurs
        let collabRes = { data: [] }
        if (user.role === "admin" || user.role === "assistant") {
          collabRes = await axios.get("/api/collaborateurs")
        }

        const ticketRes = await axios.get(ticketEndpoint)
        console.log("Ticket data received:", ticketRes.data)

        setTicket(ticketRes.data)
        setCollaborateurs(collabRes.data)

        if (ticketRes.data.collaborateur) {
          setSelectedCollaborateur(ticketRes.data.collaborateur._id)
        }
      } catch (err) {
        console.error("Error fetching ticket details:", err)
        setError("Erreur lors du chargement du ticket")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user])

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdateLoading(true)
      await axios.put(`/api/tickets/${id}/status`, { status: newStatus })

      setTicket((prev) => ({
        ...prev,
        etat: newStatus,
      }))
    } catch (err) {
      setError("Erreur lors de la mise à jour du statut")
      console.error(err)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleAssignCollaborateur = async () => {
    if (!selectedCollaborateur) return

    try {
      setUpdateLoading(true)
      const res = await axios.put(`/api/tickets/${id}/assign`, {
        collaborateurId: selectedCollaborateur,
      })

      setTicket(res.data)
    } catch (err) {
      setError("Erreur lors de l'assignation du collaborateur")
      console.error(err)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      setUpdateLoading(true)
      const res = await axios.post(`/api/tickets/${id}/comments`, {
        text: comment,
      })

      setTicket(res.data)
      setComment("")
    } catch (err) {
      setError("Erreur lors de l'ajout du commentaire")
      console.error(err)
    } finally {
      setUpdateLoading(false)
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
            <p className="text-slate-600 font-medium">Chargement du ticket...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
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
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
        >
          Retour
        </button>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 hover:text-teal-800 transition-colors flex items-center group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-slate-800">Ticket #{ticket._id.substring(0, 8)}</h1>
              <p className="text-slate-500">
                Créé le {new Date(ticket.date).toLocaleDateString()} à {new Date(ticket.date).toLocaleTimeString()}
              </p>
            </div>

            <span
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                ticket.etat === "ouvert"
                  ? "bg-amber-100 text-amber-800"
                  : ticket.etat === "en_cours"
                    ? "bg-teal-100 text-teal-800"
                    : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {ticket.etat === "ouvert" ? "Ouvert" : ticket.etat === "en_cours" ? "En cours" : "Fermé"}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Détails du problème</h2>
            <p className="mb-6 whitespace-pre-wrap text-slate-700 bg-slate-50 p-4 rounded-lg">{ticket.observation}</p>

            {ticket.modeIntervention && (
              <div className="mb-6 bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-slate-800">Mode d'intervention</h3>
                <p className="text-slate-700">{ticket.modeIntervention}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-slate-800">Commentaires</h3>

              {ticket.comments && ticket.comments.length > 0 ? (
                <div className="space-y-4">
                  {ticket.comments.map((comment, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-slate-800">
                          {comment.user.nom} {comment.user.prenom}
                        </span>
                        <span className="text-sm text-slate-500">
                          {new Date(comment.date).toLocaleDateString()} {new Date(comment.date).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">Aucun commentaire</p>
              )}

              <form onSubmit={handleAddComment} className="mt-6">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-3 mb-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ajouter un commentaire..."
                  rows="3"
                ></textarea>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center"
                  disabled={updateLoading || !comment.trim()}
                >
                  {updateLoading ? (
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
                      Envoi...
                    </>
                  ) : (
                    <>
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
                          d="M7 11l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                      Ajouter un commentaire
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="bg-slate-50 p-5 rounded-lg mb-6">
              <h3 className="font-semibold mb-4 text-slate-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Informations client
              </h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="font-medium text-slate-600">Nom:</span>
                  <span className="text-slate-800">{ticket.client.nom}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-slate-600">Email:</span>
                  <span className="text-slate-800">{ticket.client.email}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-slate-600">Téléphone:</span>
                  <span className="text-slate-800">{ticket.client.telephone}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-slate-600">Adresse:</span>
                  <span className="text-slate-800">{ticket.client.adresse}</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-lg mb-6">
              <h3 className="font-semibold mb-4 text-slate-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-teal-600"
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
                Informations demandeur
              </h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="font-medium text-slate-600">Nom:</span>
                  <span className="text-slate-800">
                    {ticket.demandeur.nom} {ticket.demandeur.prenom}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-slate-600">Email:</span>
                  <span className="text-slate-800">{ticket.demandeur.email}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-slate-600">Téléphone:</span>
                  <span className="text-slate-800">{ticket.demandeur.telephone}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-slate-600">Fonction:</span>
                  <span className="text-slate-800">{ticket.demandeur.fonction}</span>
                </p>
              </div>
            </div>

            {(user.role === "admin" || user.role === "assistant") && (
              <div className="bg-slate-50 p-5 rounded-lg mb-6">
                <h3 className="font-semibold mb-4 text-slate-800 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-teal-600"
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
                  Assignation
                </h3>

                {ticket.collaborateur ? (
                  <div className="mb-4 p-3 bg-teal-50 rounded-lg border border-teal-100">
                    <p className="flex justify-between">
                      <span className="font-medium text-slate-600">Assigné à:</span>
                      <span className="text-slate-800">
                        {ticket.collaborateur.nom} {ticket.collaborateur.prenom}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-slate-600">Spécialité:</span>
                      <span className="text-slate-800">{ticket.collaborateur.specialite}</span>
                    </p>
                  </div>
                ) : (
                  <p className="mb-4 text-amber-600 flex items-center">
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Non assigné
                  </p>
                )}

                <div>
                  <select
                    value={selectedCollaborateur}
                    onChange={(e) => setSelectedCollaborateur(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3 mb-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Sélectionner un collaborateur</option>
                    {collaborateurs.map((collab) => (
                      <option key={collab._id} value={collab._id}>
                        {collab.nom} {collab.prenom} - {collab.specialite}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAssignCollaborateur}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 w-full flex items-center justify-center"
                    disabled={updateLoading || !selectedCollaborateur}
                  >
                    {updateLoading ? (
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
                        Assignation...
                      </>
                    ) : (
                      <>
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
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Assigner
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-5 rounded-lg">
              <h3 className="font-semibold mb-4 text-slate-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
                Actions
              </h3>

              <div className="space-y-3">
                {ticket.etat === "ouvert" && (
                  <button
                    onClick={() => handleStatusChange("en_cours")}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 w-full flex items-center justify-center"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
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
                        Mise à jour...
                      </>
                    ) : (
                      <>
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
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Marquer en cours
                      </>
                    )}
                  </button>
                )}

                {ticket.etat === "en_cours" && (
                  <button
                    onClick={() => handleStatusChange("ferme")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 w-full flex items-center justify-center"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
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
                        Mise à jour...
                      </>
                    ) : (
                      <>
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
                        Marquer comme résolu
                      </>
                    )}
                  </button>
                )}

                {ticket.etat === "ferme" && (user.role === "admin" || user.role === "assistant") && (
                  <button
                    onClick={() => handleStatusChange("ouvert")}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 w-full flex items-center justify-center"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
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
                        Mise à jour...
                      </>
                    ) : (
                      <>
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
                        Réouvrir le ticket
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default TicketDetails
