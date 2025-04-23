import React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import Layout from "../components/Layout"
import ClientSearch from "../components/ClientSearch"

const CreateTicket = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const clientIdParam = queryParams.get("client")
  const demandeurIdParam = queryParams.get("demandeur")

  const [formData, setFormData] = useState({
    client: clientIdParam || "",
    demandeur: demandeurIdParam || "",
    observation: "",
    type: "bug",
    modeIntervention: "",
  })
  const [clients, setClients] = useState([])
  const [demandeurs, setDemandeurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [clientDemandeurs, setClientDemandeurs] = useState([])
  const [loadingDemandeurs, setLoadingDemandeurs] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [showDemandeurForm, setShowDemandeurForm] = useState(false)
  const [demandeurFormData, setDemandeurFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    fonction: "",
  })
  const [submittingDemandeur, setSubmittingDemandeur] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes] = await Promise.all([axios.get("/api/clients")])

        setClients(clientsRes.data)

        // If client ID is provided in URL, fetch its demandeurs
        if (clientIdParam) {
          await fetchDemandeurs(clientIdParam)

          // Find the client in the list
          const client = clientsRes.data.find((c) => c._id === clientIdParam)
          if (client) {
            setSelectedClient(client)
          }
        }

        // If demandeur ID is provided, make sure we have the right client selected
        if (demandeurIdParam && !clientIdParam) {
          try {
            const demandeurRes = await axios.get(`/api/demandeurs/${demandeurIdParam}`)
            if (demandeurRes.data && demandeurRes.data.client) {
              setFormData((prev) => ({
                ...prev,
                client: demandeurRes.data.client._id,
              }))

              // Find the client in the list
              const client = clientsRes.data.find((c) => c._id === demandeurRes.data.client._id)
              if (client) {
                setSelectedClient(client)
              }

              await fetchDemandeurs(demandeurRes.data.client._id)
            }
          } catch (err) {
            console.error("Error fetching demandeur details:", err)
          }
        }
      } catch (err) {
        setError("Erreur lors du chargement des données")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [clientIdParam, demandeurIdParam])

  const fetchDemandeurs = async (clientId) => {
    if (!clientId) return

    try {
      setLoadingDemandeurs(true)
      console.log("Fetching demandeurs for client:", clientId)
      const res = await axios.get(`/api/clients/${clientId}/demandeurs`)
      console.log("Demandeurs received:", res.data)
      setClientDemandeurs(res.data)

      // If demandeur ID is provided in URL and matches one of the fetched demandeurs, select it
      if (demandeurIdParam) {
        const matchingDemandeur = res.data.find((d) => d._id === demandeurIdParam)
        if (matchingDemandeur) {
          setFormData((prev) => ({
            ...prev,
            demandeur: demandeurIdParam,
          }))
        }
      }
    } catch (err) {
      console.error("Error fetching demandeurs:", err)
      setClientDemandeurs([])
    } finally {
      setLoadingDemandeurs(false)
    }
  }

  const handleClientSelect = (client) => {
    if (client) {
      setSelectedClient(client)
      setFormData((prev) => ({ ...prev, client: client._id, demandeur: "" }))
      fetchDemandeurs(client._id)
    } else {
      setSelectedClient(null)
      setFormData((prev) => ({ ...prev, client: "", demandeur: "" }))
      setClientDemandeurs([])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDemandeurChange = (e) => {
    const { name, value } = e.target
    setDemandeurFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDemandeurSubmit = async (e) => {
    e.preventDefault()

    if (!formData.client) {
      setError("Veuillez d'abord sélectionner un client")
      return
    }

    try {
      setSubmittingDemandeur(true)

      // Créer le nouveau demandeur
      const newDemandeurData = {
        ...demandeurFormData,
        client: formData.client,
      }

      const res = await axios.post("/api/demandeurs", newDemandeurData)
      const newDemandeur = res.data

      // Ajouter le nouveau demandeur à la liste et le sélectionner
      setClientDemandeurs((prev) => [...prev, newDemandeur])
      setFormData((prev) => ({ ...prev, demandeur: newDemandeur._id }))

      // Réinitialiser le formulaire et le fermer
      setDemandeurFormData({
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        fonction: "",
      })
      setShowDemandeurForm(false)

      // Afficher un message de succès
      alert("Demandeur ajouté avec succès!")
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du demandeur")
      console.error(err)
    } finally {
      setSubmittingDemandeur(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSubmitting(true)
      setError(null)

      console.log("Submitting ticket data:", formData)
      const res = await axios.post("/api/tickets", formData)
      navigate(`/tickets/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du ticket")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // Formulaire modal pour ajouter un demandeur
  const renderDemandeurForm = () => {
    if (!showDemandeurForm) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
          <div className="p-6 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-800">Ajouter un demandeur</h3>
              <button
                type="button"
                onClick={() => setShowDemandeurForm(false)}
                className="text-slate-400 hover:text-slate-600"
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

          <form onSubmit={handleDemandeurSubmit} className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-2" htmlFor="nom-demandeur">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="nom-demandeur"
                    name="nom"
                    value={demandeurFormData.nom}
                    onChange={handleDemandeurChange}
                    className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2" htmlFor="prenom-demandeur">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="prenom-demandeur"
                    name="prenom"
                    value={demandeurFormData.prenom}
                    onChange={handleDemandeurChange}
                    className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2" htmlFor="telephone-demandeur">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  id="telephone-demandeur"
                  name="telephone"
                  value={demandeurFormData.telephone}
                  onChange={handleDemandeurChange}
                  className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2" htmlFor="email-demandeur">
                  Email *
                </label>
                <input
                  type="email"
                  id="email-demandeur"
                  name="email"
                  value={demandeurFormData.email}
                  onChange={handleDemandeurChange}
                  className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2" htmlFor="fonction-demandeur">
                  Fonction *
                </label>
                <input
                  type="text"
                  id="fonction-demandeur"
                  name="fonction"
                  value={demandeurFormData.fonction}
                  onChange={handleDemandeurChange}
                  className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  required
                  placeholder="Ex: Directeur, Responsable IT, etc."
                />
              </div>

              {selectedClient && (
                <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-3 rounded-lg flex items-center">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Ajout d'un demandeur pour le client: <strong className="ml-1">{selectedClient.nom}</strong>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDemandeurForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-lg transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center"
                disabled={submittingDemandeur}
              >
                {submittingDemandeur ? (
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
                    Création...
                  </>
                ) : (
                  "Créer le demandeur"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

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

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all duration-200 hover:shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Créer un nouveau ticket</h1>

        {error && (
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
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-slate-700 font-medium mb-2" htmlFor="client">
                Client *
              </label>
              <ClientSearch
                selectedClientId={formData.client}
                onClientSelect={handleClientSelect}
                disabled={clientIdParam !== null}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2" htmlFor="demandeur">
                Demandeur *
              </label>
              {loadingDemandeurs ? (
                <div className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 flex items-center">
                  <div className="w-4 h-4 rounded-full bg-teal-500 animate-pulse mr-2"></div>
                  <span className="text-slate-600">Chargement des demandeurs...</span>
                </div>
              ) : (
                <select
                  id="demandeur"
                  name="demandeur"
                  value={formData.demandeur}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled={!formData.client || clientDemandeurs.length === 0}
                >
                  <option value="">Sélectionner un demandeur</option>
                  {clientDemandeurs.map((demandeur) => (
                    <option key={demandeur._id} value={demandeur._id}>
                      {demandeur.nom} {demandeur.prenom} - {demandeur.fonction}
                    </option>
                  ))}
                </select>
              )}
              {formData.client && (
                <div className="flex items-center mt-2">
                  {clientDemandeurs.length === 0 && !loadingDemandeurs ? (
                    <div className="flex items-center text-amber-600">
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
                          d="M12 9v2m0 4h.01M-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p className="text-sm">Aucun demandeur pour ce client.</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">{clientDemandeurs.length} demandeur(s) disponible(s)</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowDemandeurForm(true)}
                    className="ml-auto bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium flex items-center"
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
                    Ajouter un demandeur
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-slate-700 font-medium mb-2" htmlFor="type">
                Type de problème *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="bug">Bug</option>
                <option value="feature">Nouvelle fonctionnalité</option>
                <option value="support">Support</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2" htmlFor="modeIntervention">
                Mode d'intervention *
              </label>
              <select
                id="modeIntervention"
                name="modeIntervention"
                value={formData.modeIntervention}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Sélectionner un mode</option>
                <option value="A distance">A distance</option>
                <option value="Sur place">Sur place</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-slate-700 font-medium mb-2" htmlFor="observation">
              Description du problème *
            </label>
            <textarea
              id="observation"
              name="observation"
              value={formData.observation}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              rows="6"
              required
              placeholder="Décrivez le problème en détail..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
                  Création...
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Créer le ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      {renderDemandeurForm()}
    </Layout>
  )
}

export default CreateTicket
