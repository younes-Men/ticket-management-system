const express = require("express")
const Demandeur = require("../models/Demandeur")
const Client = require("../models/Client")
const { auth, isAdminOrAssistant } = require("../middleware/auth")
const router = express.Router()

// Get all demandeurs
router.get("/", auth, async (req, res) => {
  try {
    const demandeurs = await Demandeur.find().populate("client", "nom").sort({ nom: 1 })

    res.json(demandeurs)
  } catch (error) {
    console.error("Get demandeurs error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des demandeurs" })
  }
})

// Get demandeur by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const demandeur = await Demandeur.findById(req.params.id).populate("client", "nom email telephone adresse")

    if (!demandeur) {
      return res.status(404).json({ message: "Demandeur non trouvé" })
    }

    res.json(demandeur)
  } catch (error) {
    console.error("Get demandeur error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération du demandeur" })
  }
})

// Create new demandeur
router.post("/", auth, isAdminOrAssistant, async (req, res) => {
  try {
    console.log("Creating demandeur with data:", req.body)
    const { nom, prenom, telephone, email, fonction, client } = req.body

    // Check if client exists
    const clientExists = await Client.findById(client)

    if (!clientExists) {
      return res.status(404).json({ message: "Client non trouvé" })
    }

    // Create new demandeur
    const demandeur = new Demandeur({
      nom,
      prenom,
      telephone,
      email,
      fonction,
      client,
    })

    await demandeur.save()
    console.log("Demandeur created:", demandeur)

    // Populate client info
    await demandeur.populate("client", "nom")

    res.status(201).json(demandeur)
  } catch (error) {
    console.error("Create demandeur error:", error)
    res.status(500).json({ message: "Erreur lors de la création du demandeur" })
  }
})

// Update demandeur
router.put("/:id", auth, isAdminOrAssistant, async (req, res) => {
  try {
    const { nom, prenom, telephone, email, fonction, client } = req.body

    // Check if demandeur exists
    const demandeur = await Demandeur.findById(req.params.id)

    if (!demandeur) {
      return res.status(404).json({ message: "Demandeur non trouvé" })
    }

    // Check if client exists if provided
    if (client) {
      const clientExists = await Client.findById(client)

      if (!clientExists) {
        return res.status(404).json({ message: "Client non trouvé" })
      }
    }

    // Update demandeur
    demandeur.nom = nom || demandeur.nom
    demandeur.prenom = prenom || demandeur.prenom
    demandeur.telephone = telephone || demandeur.telephone
    demandeur.email = email || demandeur.email
    demandeur.fonction = fonction || demandeur.fonction
    demandeur.client = client || demandeur.client

    await demandeur.save()

    // Populate client info
    await demandeur.populate("client", "nom")

    res.json(demandeur)
  } catch (error) {
    console.error("Update demandeur error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour du demandeur" })
  }
})

// Delete demandeur
router.delete("/:id", auth, isAdminOrAssistant, async (req, res) => {
  try {
    // Check if demandeur exists
    const demandeur = await Demandeur.findById(req.params.id)

    if (!demandeur) {
      return res.status(404).json({ message: "Demandeur non trouvé" })
    }

    // Delete demandeur
    await demandeur.deleteOne()
    res.json({ message: "Demandeur supprimé avec succès" })
  } catch (error) {
    console.error("Delete demandeur error:", error)
    res.status(500).json({ message: "Erreur lors de la suppression du demandeur" })
  }
})

module.exports = router
