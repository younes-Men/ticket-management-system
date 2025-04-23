const express = require("express")
const Client = require("../models/Client")
const Demandeur = require("../models/Demandeur")
const { auth, isAdminOrAssistant } = require("../middleware/auth")
const router = express.Router()

// Get all clients
router.get("/", auth, async (req, res) => {
  try {
    const clients = await Client.find().sort({ nom: 1 })
    res.json(clients)
  } catch (error) {
    console.error("Get clients error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des clients" })
  }
})

// Get client by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)

    if (!client) {
      return res.status(404).json({ message: "Client non trouvé" })
    }

    res.json(client)
  } catch (error) {
    console.error("Get client error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération du client" })
  }
})

// Create new client
router.post("/", auth, isAdminOrAssistant, async (req, res) => {
  try {
    const { nom, telephone, email, adresse } = req.body

    // Check if client with same email already exists
    const existingClient = await Client.findOne({ email })

    if (existingClient) {
      return res.status(400).json({ message: "Un client avec cet email existe déjà" })
    }

    // Create new client
    const client = new Client({
      nom,
      telephone,
      email,
      adresse,
    })

    await client.save()
    res.status(201).json(client)
  } catch (error) {
    console.error("Create client error:", error)
    res.status(500).json({ message: "Erreur lors de la création du client" })
  }
})

// Update client
router.put("/:id", auth, isAdminOrAssistant, async (req, res) => {
  try {
    const { nom, telephone, email, adresse } = req.body

    // Check if client exists
    const client = await Client.findById(req.params.id)

    if (!client) {
      return res.status(404).json({ message: "Client non trouvé" })
    }

    // Update client
    client.nom = nom || client.nom
    client.telephone = telephone || client.telephone
    client.email = email || client.email
    client.adresse = adresse || client.adresse

    await client.save()
    res.json(client)
  } catch (error) {
    console.error("Update client error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour du client" })
  }
})

// Delete client
router.delete("/:id", auth, isAdminOrAssistant, async (req, res) => {
  try {
    // Check if client exists
    const client = await Client.findById(req.params.id)

    if (!client) {
      return res.status(404).json({ message: "Client non trouvé" })
    }

    // Check if client has demandeurs
    const demandeurs = await Demandeur.find({ client: req.params.id })

    if (demandeurs.length > 0) {
      return res.status(400).json({
        message: "Impossible de supprimer ce client car il a des demandeurs associés",
      })
    }

    // Delete client
    await client.remove()
    res.json({ message: "Client supprimé avec succès" })
  } catch (error) {
    console.error("Delete client error:", error)
    res.status(500).json({ message: "Erreur lors de la suppression du client" })
  }
})

// Get demandeurs for a client
router.get("/:id/demandeurs", auth, async (req, res) => {
  try {
    console.log(`Fetching demandeurs for client: ${req.params.id}`)
    const demandeurs = await Demandeur.find({ client: req.params.id }).sort({ nom: 1 })
    console.log(`Found ${demandeurs.length} demandeurs`)
    res.json(demandeurs)
  } catch (error) {
    console.error("Get client demandeurs error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des demandeurs" })
  }
})

module.exports = router
