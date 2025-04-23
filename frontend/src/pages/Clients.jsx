import React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import Layout from "../components/Layout"
import { Link } from "react-router-dom"

const Clients = () => {
  const [clients, setClients] = useState([])
  const [demandeurs, setDemandeurs] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedClient, setExpandedClient] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get("/api/clients")
        setClients(res.data)

        // Fetch demandeurs for each client
        const demandeursData = {}
        for (const client of res.data) {
          try {
            const demandeurRes = await axios.get(`/api/clients/${client._id}/demandeurs`)
            demandeursData[client._id] = demandeurRes.data
          } catch (err) {
            console.error(`Error fetching demandeurs for client ${client._id}:`, err)
            demandeursData[client._id] = []
          }
        }
        setDemandeurs(demandeursData)
      } catch (err) {
        setError("Erreur lors du chargement des clients")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  const toggleClientExpand = (clientId) => {
    if (expandedClient === clientId) {
      setExpandedClient(null)
    } else {
      setExpandedClient(clientId)
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Nouvelles fonctions pour la suppression
  const handleOpenDeleteModal = (client) => {
    setClientToDelete(client)
    setIsDeleteModalOpen(true)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setClientToDelete(null)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!clientToDelete) return

    try {
      setIsDeleting(true)
      setDeleteError(null)

      await axios.delete(`/api/clients/${clientToDelete._id}`)

      // Supprimer le client de la liste
      setClients(clients.filter((c) => c._id !== clientToDelete._id))

      handleCloseDeleteModal()
    } catch (err) {
      console.error("Error deleting client:", err)
      setDeleteError(
        err.response?.data?.message ||
          "Erreur lors de la suppression du client. Vérifiez qu'il n'est pas associé à des tickets existants.",
      )
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
            <p className="text-slate-600 font-medium">Chargement des clients...</p>
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
        <h1 className="text-3xl font-bold text-slate-800">Clients</h1>

        <Link
          to="/clients/create"
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
          Nouveau Client
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/3 border border-slate-200 rounded-lg pl-10 p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm">
                <th className="py-3 px-4 text-left font-medium">Nom</th>
                <th className="py-3 px-4 text-left font-medium">Email</th>
                <th className="py-3 px-4 text-left font-medium">Téléphone</th>
                <th className="py-3 px-4 text-left font-medium">Adresse</th>
                <th className="py-3 px-4 text-left font-medium">Demandeurs</th>
                <th className="py-3 px-4 text-left font-medium">Date de création</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <>
                  <tr
                    key={client._id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 font-medium text-slate-700">{client.nom}</td>
                    <td className="py-3 px-4 text-slate-600">{client.email}</td>
                    <td className="py-3 px-4 text-slate-600">{client.telephone}</td>
                    <td className="py-3 px-4 text-slate-600">{client.adresse}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="mr-2 text-slate-600">
                          {demandeurs[client._id] ? demandeurs[client._id].length : 0} demandeur(s)
                        </span>
                        <button
                          onClick={() => toggleClientExpand(client._id)}
                          className="text-teal-600 hover:text-teal-800 transition-colors font-medium text-sm"
                        >
                          {expandedClient === client._id ? "Masquer" : "Voir"}
                        </button>
                        <Link
                          to={`/demandeurs/create?client=${client._id}`}
                          className="ml-2 bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200"
                        >
                          + Ajouter
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{new Date(client.dateCreation).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Link
                          to={`/tickets/create?client=${client._id}`}
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
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Créer ticket
                        </Link>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => handleOpenDeleteModal(client)}
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
                      </div>
                    </td>
                  </tr>
                  {expandedClient === client._id && (
                    <tr>
                      <td colSpan="7" className="py-2 px-4 bg-slate-50">
                        <div className="p-4 border border-slate-200 rounded-lg">
                          <h3 className="font-semibold mb-3 text-slate-800 flex items-center">
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
                            Liste des demandeurs:
                          </h3>
                          {demandeurs[client._id] && demandeurs[client._id].length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {demandeurs[client._id].map((demandeur) => (
                                <div
                                  key={demandeur._id}
                                  className="border border-slate-200 p-3 rounded-lg bg-white hover:shadow-sm transition-all duration-200"
                                >
                                  <p className="font-medium text-slate-800">
                                    {demandeur.nom} {demandeur.prenom}
                                  </p>
                                  <p className="text-sm text-teal-600 font-medium">{demandeur.fonction}</p>
                                  <p className="text-sm text-slate-600 flex items-center mt-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                      />
                                    </svg>
                                    {demandeur.email}
                                  </p>
                                  <p className="text-sm text-slate-600 flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                      />
                                    </svg>
                                    {demandeur.telephone}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-500 italic">Aucun demandeur pour ce client</p>
                          )}
                          <div className="mt-4">
                            <Link
                              to={`/demandeurs/create?client=${client._id}`}
                              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-200 inline-flex items-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                              Ajouter un demandeur
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}

              {filteredClients.length === 0 && (
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
                      Aucun client trouvé
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && clientToDelete && (
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
                  Êtes-vous sûr de vouloir supprimer le client{" "}
                  <span className="font-semibold">{clientToDelete.nom}</span>?
                </p>
                <p className="text-center text-slate-500 text-sm mt-2">
                  Cette action est irréversible et supprimera définitivement ce client ainsi que tous ses demandeurs
                  associés.
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

export default Clients
