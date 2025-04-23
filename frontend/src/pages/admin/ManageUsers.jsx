import React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import Layout from "../../components/Layout"

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "collaborator",
    specialite: "",
    motDePasse: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  // États pour la suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // États pour la modification
  const [editMode, setEditMode] = useState(false)
  const [userIdToEdit, setUserIdToEdit] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/api/admin/users")
      setUsers(res.data)
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    try {
      if (editMode && userIdToEdit) {
        // Mode édition
        const dataToUpdate = { ...formData }
        // Si le mot de passe est vide, on ne l'envoie pas
        if (!dataToUpdate.motDePasse) {
          delete dataToUpdate.motDePasse
        }

        const response = await axios.put(`/api/admin/users/${userIdToEdit}`, dataToUpdate)

        // Mettre à jour l'utilisateur dans la liste
        setUsers(users.map((user) => (user._id === userIdToEdit ? response.data : user)))

        // Réinitialiser le formulaire et le mode d'édition
        resetForm()
      } else {
        // Mode création
        const response = await axios.post("/api/admin/users", formData)
        setUsers([...users, response.data])
        resetForm()
      }
    } catch (err) {
      console.error("Erreur:", err)
      setFormError(
        err.response?.data?.message ||
          `Erreur lors de ${editMode ? "la modification" : "la création"} de l'utilisateur`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      role: "collaborator",
      specialite: "",
      motDePasse: "",
    })
    setEditMode(false)
    setUserIdToEdit(null)
    setShowForm(false)
    setFormError(null)
  }

  // Fonction pour ouvrir le formulaire en mode édition
  const handleEdit = (user) => {
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      specialite: user.specialite || "",
      motDePasse: "", // Champ vide pour le mot de passe
    })
    setEditMode(true)
    setUserIdToEdit(user._id)
    setShowForm(true)
    setFormError(null)

    // Faire défiler vers le haut pour voir le formulaire
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Fonction pour ouvrir la modal de suppression
  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  // Fonction pour fermer la modal de suppression
  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  // Fonction pour supprimer un utilisateur
  const confirmDelete = async () => {
    if (!userToDelete) return

    setDeleting(true)
    try {
      await axios.delete(`/api/admin/users/${userToDelete._id}`)

      // Supprimer l'utilisateur de la liste
      setUsers(users.filter((user) => user._id !== userToDelete._id))

      // Fermer la modal
      closeDeleteModal()
    } catch (err) {
      console.error("Erreur lors de la suppression:", err)
      alert(
        err.response?.data?.message ||
          "Erreur lors de la suppression de l'utilisateur. Vérifiez qu'il n'est pas associé à des tickets existants.",
      )
    } finally {
      setDeleting(false)
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
            <p className="text-slate-600 font-medium">Chargement des utilisateurs...</p>
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
        <h1 className="text-3xl font-bold text-slate-800">Gestion des utilisateurs</h1>

        <button
          onClick={() => {
            if (showForm && editMode) {
              resetForm()
            } else {
              setShowForm(!showForm)
            }
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {showForm ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            )}
          </svg>
          {showForm ? "Annuler" : "Nouvel utilisateur"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6 transition-all duration-200 hover:shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
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
                d={
                  editMode
                    ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    : "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                }
              />
            </svg>
            {editMode ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
          </h2>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-slate-700 font-medium mb-2" htmlFor="role">
                  Rôle *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="admin">Administrateur</option>
                  <option value="assistant">Assistant</option>
                  <option value="collaborator">Collaborateur</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2" htmlFor="specialite">
                  Spécialité {formData.role === "collaborator" && "*"}
                </label>
                <input
                  type="text"
                  id="specialite"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleChange}
                  className={`w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
                    formData.role !== "collaborator" ? "bg-slate-50 cursor-not-allowed" : ""
                  }`}
                  required={formData.role === "collaborator"}
                  disabled={formData.role !== "collaborator"}
                  placeholder="Ex: Développeur Web, DevOps, etc."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2" htmlFor="motDePasse">
                  {editMode ? "Nouveau mot de passe" : "Mot de passe *"}
                </label>
                <input
                  type="password"
                  id="motDePasse"
                  name="motDePasse"
                  value={formData.motDePasse}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  required={!editMode}
                  placeholder={editMode ? "Laisser vide pour ne pas modifier" : ""}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
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
                    {editMode ? "Modification..." : "Création..."}
                  </>
                ) : editMode ? (
                  "Enregistrer les modifications"
                ) : (
                  "Créer l'utilisateur"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm">
                <th className="py-3 px-4 text-left font-medium">Nom</th>
                <th className="py-3 px-4 text-left font-medium">Email</th>
                <th className="py-3 px-4 text-left font-medium">Rôle</th>
                <th className="py-3 px-4 text-left font-medium">Spécialité</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {user.nom} {user.prenom}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "assistant"
                            ? "bg-teal-100 text-teal-800"
                            : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {user.role === "admin"
                        ? "Administrateur"
                        : user.role === "assistant"
                          ? "Assistant"
                          : "Collaborateur"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{user.specialite || "-"}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(user)}
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
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
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
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
                      Aucun utilisateur trouvé
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600 mr-2"
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
              Confirmer la suppression
            </h3>

            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              <span className="font-semibold">
                {userToDelete.nom} {userToDelete.prenom}
              </span>{" "}
              ? Cette action est irréversible.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center"
                disabled={deleting}
              >
                {deleting ? (
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
      )}
    </Layout>
  )
}

export default ManageUsers
