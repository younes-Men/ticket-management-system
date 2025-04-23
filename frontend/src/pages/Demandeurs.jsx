import React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import Layout from "../components/Layout"
import { Link } from "react-router-dom"

const Demandeurs = () => {
  const [demandeurs, setDemandeurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDemandeur, setCurrentDemandeur] = useState(null)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    fonction: "",
    client: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [demandeurToDelete, setDemandeurToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    const fetchDemandeurs = async () => {
      try {
        const res = await axios.get("/api/demandeurs")
        setDemandeurs(res.data)
      } catch (err) {
        setError("Erreur lors du chargement des demandeurs")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDemandeurs()
  }, [])

  const filteredDemandeurs = demandeurs.filter(
    (demandeur) =>
      demandeur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demandeur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demandeur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (demandeur.client?.nom && demandeur.client.nom.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleOpenModal = (demandeur) => {
    setCurrentDemandeur(demandeur)
    setFormData({
      nom: demandeur.nom,
      prenom: demandeur.prenom,
      telephone: demandeur.telephone,
      email: demandeur.email,
      fonction: demandeur.fonction,
      client: demandeur.client?._id || "",
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentDemandeur(null)
    setFormError(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentDemandeur) return

    try {
      setSubmitting(true)
      setFormError(null)

      const res = await axios.put(`/api/demandeurs/${currentDemandeur._id}`, formData)

      // Update the demandeur in the list
      setDemandeurs(
        demandeurs.map((d) => (d._id === currentDemandeur._id ? { ...res.data, client: currentDemandeur.client } : d)),
      )

      handleCloseModal()
    } catch (err) {
      console.error("Error updating demandeur:", err)
      setFormError(err.response?.data?.message || "Erreur lors de la mise à jour du demandeur")
    } finally {
      setSubmitting(false)
    }
  }

  // Nouvelles fonctions pour la suppression
  const handleOpenDeleteModal = (demandeur) => {
    setDemandeurToDelete(demandeur)
    setIsDeleteModalOpen(true)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDemandeurToDelete(null)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!demandeurToDelete) return

    try {
      setIsDeleting(true)
      setDeleteError(null)

      await axios.delete(`/api/demandeurs/${demandeurToDelete._id}`)

      // Supprimer le demandeur de la liste
      setDemandeurs(demandeurs.filter((d) => d._id !== demandeurToDelete._id))

      handleCloseDeleteModal()
    } catch (err) {
      console.error("Error deleting demandeur:", err)
      setDeleteError(
        err.response?.data?.message ||
          "Erreur lors de la suppression du demandeur. Vérifiez qu'il n'est pas associé à des tickets existants.",
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
            <p className="text-slate-600 font-medium">Chargement des demandeurs...</p>
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
        <h1 className="text-3xl font-bold text-slate-800">Demandeurs</h1>

        <Link
          to="/demandeurs/create"
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
          Nouveau Demandeur
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
              placeholder="Rechercher un demandeur..."
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
                <th className="py-3 px-4 text-left font-medium">Client</th>
                <th className="py-3 px-4 text-left font-medium">Email</th>
                <th className="py-3 px-4 text-left font-medium">Téléphone</th>
                <th className="py-3 px-4 text-left font-medium">Fonction</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDemandeurs.map((demandeur) => (
                <tr
                  key={demandeur._id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {demandeur.nom} {demandeur.prenom}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{demandeur.client?.nom || "N/A"}</td>
                  <td className="py-3 px-4 text-slate-600">{demandeur.email}</td>
                  <td className="py-3 px-4 text-slate-600">{demandeur.telephone}</td>
                  <td className="py-3 px-4 text-slate-600">{demandeur.fonction}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Link
                        to={`/tickets/create?demandeur=${demandeur._id}`}
                        className="text-teal-600 hover:text-teal-800 transition-colors font-medium text-sm"
                      >
                        Créer ticket
                      </Link>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => handleOpenModal(demandeur)}
                        className="text-teal-600 hover:text-teal-800 transition-colors font-medium text-sm"
                      >
                        Modifier
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => handleOpenDeleteModal(demandeur)}
                        className="text-red-600 hover:text-red-800 transition-colors font-medium text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDemandeurs.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
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
                      Aucun demandeur trouvé
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal pour modifier un demandeur */}
      {isModalOpen && currentDemandeur && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">
                  Modifier le demandeur: {currentDemandeur.nom} {currentDemandeur.prenom}
                </h2>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
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
              {formError && (
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
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2" htmlFor="nom">
                      Nom *
                    </label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2" htmlFor="prenom">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2" htmlFor="telephone">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2" htmlFor="email">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-slate-700 font-medium mb-2" htmlFor="fonction">
                    Fonction *
                  </label>
                  <input
                    type="text"
                    id="fonction"
                    name="fonction"
                    value={formData.fonction}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    required
                    placeholder="Ex: Directeur, Responsable IT, etc."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-slate-700 font-medium mb-2">Client</label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {currentDemandeur.client?.nom || "Aucun client associé"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pour changer le client, veuillez créer un nouveau demandeur.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-lg transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center"
                    disabled={submitting}
                  >
                    {submitting ? (
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
                      "Enregistrer les modifications"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && demandeurToDelete && (
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
                  Êtes-vous sûr de vouloir supprimer le demandeur{" "}
                  <span className="font-semibold">
                    {demandeurToDelete.nom} {demandeurToDelete.prenom}
                  </span>
                  ?
                </p>
                <p className="text-center text-slate-500 text-sm mt-2">
                  Cette action est irréversible et supprimera définitivement ce demandeur.
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

export default Demandeurs
