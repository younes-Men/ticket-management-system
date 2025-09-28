import React, { useState, useEffect } from "react"
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
        let ticketEndpoint = `/api/tickets/${id}`
        if (user.role === "collaborator") {
          ticketEndpoint = `/api/collaborator/tickets/${id}`
        }

        let collabRes = { data: [] }
        if (user.role === "admin" || user.role === "assistant") {
          collabRes = await axios.get("/api/collaborateurs")
        }

        const ticketRes = await axios.get(ticketEndpoint)
        setTicket(ticketRes.data)
        setCollaborateurs(collabRes.data)

        if (ticketRes.data.collaborateur) {
          setSelectedCollaborateur(ticketRes.data.collaborateur._id)
        }
      } catch (err) {
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
      setTicket((prev) => ({ ...prev, etat: newStatus }))
    } catch (err) {
      setError("Erreur lors de la mise à jour du statut")
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
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      setUpdateLoading(true)
      const res = await axios.post(`/api/tickets/${id}/comments`, { text: comment })
      setTicket(res.data)
      setComment("")
    } catch (err) {
      setError("Erreur lors de l'ajout du commentaire")
    } finally {
      setUpdateLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600 font-medium">Chargement du ticket...</p>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-teal-600 text-white px-5 py-2.5 rounded-lg"
        >
          Retour
        </button>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Bouton Retour */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 hover:text-teal-800 flex items-center"
        >
          ← Retour
        </button>
      </div>

      {/* Carte Ticket */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Ticket #{ticket._id.substring(0, 8)}
          </h1>
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

        {/* Description */}
        <p className="mb-6 text-slate-700">{ticket.observation}</p>

        {/* Commentaires */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Commentaires</h3>
          {ticket.comments && ticket.comments.length > 0 ? (
            <div className="space-y-2">
              {ticket.comments.map((c, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-lg">
                  <p className="font-medium">{c.user.nom} {c.user.prenom}</p>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">Aucun commentaire</p>
          )}

          <form onSubmit={handleAddComment} className="mt-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg p-2"
              placeholder="Ajouter un commentaire..."
            />
            <button
              type="submit"
              className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-lg"
              disabled={updateLoading || !comment.trim()}
            >
              Ajouter
            </button>
          </form>
        </div>

        {/* Assignation Collaborateur */}
        {(user.role === "admin" || user.role === "assistant") && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Assignation</h3>
            <select
              value={selectedCollaborateur}
              onChange={(e) => setSelectedCollaborateur(e.target.value)}
              className="w-full border rounded-lg p-2 mb-2"
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
              className="bg-teal-600 text-white px-4 py-2 rounded-lg"
              disabled={updateLoading || !selectedCollaborateur}
            >
              Assigner
            </button>
          </div>
        )}

        {/* Actions sur le ticket */}
        <div className="space-y-2">
          {ticket.etat === "ouvert" && (
            <button
              onClick={() => handleStatusChange("en_cours")}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg w-full"
            >
              Marquer en cours
            </button>
          )}
          {ticket.etat === "en_cours" && (
            <button
              onClick={() => handleStatusChange("ferme")}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg w-full"
            >
              Marquer comme résolu
            </button>
          )}
          {ticket.etat === "ferme" && (user.role === "admin" || user.role === "assistant") && (
            <button
              onClick={() => handleStatusChange("ouvert")}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg w-full"
            >
              Réouvrir
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default TicketDetails
