import React from "react"
import { useState, useEffect, useRef } from "react"
import axios from "axios"

const ClientSearch = ({ selectedClientId, onClientSelect, disabled = false }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const dropdownRef = useRef(null)

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get("/api/clients")
        setClients(response.data)
        setFilteredClients(response.data)

        // If selectedClientId is provided, find and set the selected client
        if (selectedClientId) {
          const client = response.data.find((c) => c._id === selectedClientId)
          if (client) {
            setSelectedClient(client)
            setSearchTerm(client.nom)
          }
        }
      } catch (err) {
        setError("Erreur lors du chargement des clients")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [selectedClientId])

  // Filter clients when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClients(clients)
    } else {
      const filtered = clients.filter(
        (client) =>
          client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client.telephone && client.telephone.includes(searchTerm)),
      )
      setFilteredClients(filtered)
    }
  }, [searchTerm, clients])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleClientClick = (client) => {
    setSelectedClient(client)
    setSearchTerm(client.nom)
    onClientSelect(client)
    setIsOpen(false)
  }

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
    if (!isOpen) setIsOpen(true)
    if (selectedClient && e.target.value !== selectedClient.nom) {
      setSelectedClient(null)
      onClientSelect(null)
    }
  }

  const handleInputFocus = () => {
    if (!disabled) setIsOpen(true)
  }

  const clearSelection = () => {
    setSearchTerm("")
    setSelectedClient(null)
    onClientSelect(null)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          className={`w-full pl-10 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled}
        />
        <div className="absolute left-3 top-3 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        {selectedClient && !disabled && (
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            onClick={clearSelection}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">
              <svg
                className="animate-spin h-5 w-5 mx-auto mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Chargement...
            </div>
          ) : error ? (
            <div className="p-3 text-center text-red-500">{error}</div>
          ) : filteredClients.length === 0 ? (
            <div className="p-3 text-center text-gray-500">Aucun client trouvé</div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client._id}
                className="p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-0"
                onClick={() => handleClientClick(client)}
              >
                <div className="font-medium text-gray-900">{client.nom}</div>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  {client.email && (
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      {client.email}
                    </span>
                  )}
                  {client.email && client.telephone && <span className="mx-2">•</span>}
                  {client.telephone && (
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.79 19.79 0 0 1-6.11-6.11 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      {client.telephone}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ClientSearch
