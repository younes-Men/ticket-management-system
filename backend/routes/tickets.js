const express = require("express")
const Ticket = require("../models/Ticket")
const Client = require("../models/Client")
const Demandeur = require("../models/Demandeur")
const User = require("../models/User")
const { auth, isAdminOrAssistant } = require("../middleware/auth")
const router = express.Router()

// Get all tickets
router.get("/", auth, async (req, res) => {
  try {

    let query = {}
    if (req.user.role === "collaborator") {
      query = { collaborateur: req.user._id }
    }

    const tickets = await Ticket.find(query)
      .populate("client", "nom")
      .populate("demandeur", "nom prenom")
      .populate("collaborateur", "nom prenom")
      .sort({ date: -1 })

    res.json(tickets)
  } catch (error) {
    console.error("Get tickets error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des tickets" })
  }
})

// Get recent tickets
router.get("/recent", auth, async (req, res) => {
  try {
    // For collaborators, only return tickets assigned to them
    let query = {}
    if (req.user.role === "collaborator") {
      query = { collaborateur: req.user._id }
    }

    const tickets = await Ticket.find(query)
      .populate("client", "nom")
      .populate("demandeur", "nom prenom")
      .populate("collaborateur", "nom prenom")
      .sort({ date: -1 })
      .limit(5)

    res.json(tickets)
  } catch (error) {
    console.error("Get recent tickets error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des tickets récents" })
  }
})

// Get ticket by ID
router.get("/:id", auth, async (req, res) => {
  try {
    console.log(`User ${req.user._id} (${req.user.role}) requesting ticket ${req.params.id}`)

    // For collaborators, check if the ticket is assigned to them
    const query = { _id: req.params.id }
    if (req.user.role === "collaborator") {
      query.collaborateur = req.user._id
    }

    const ticket = await Ticket.findOne(query)
      .populate("client", "nom email telephone adresse")
      .populate("demandeur", "nom prenom email telephone fonction")
      .populate("collaborateur", "nom prenom specialite")
      .populate({
        path: "comments.user",
        select: "nom prenom",
      })

    if (!ticket) {
      console.log("Ticket not found or access denied")
      return res.status(404).json({ message: "Ticket non trouvé" })
    }

    console.log("Ticket found and returned")
    res.json(ticket)
  } catch (error) {
    console.error("Get ticket error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération du ticket" })
  }
})

// Create new ticket
router.post("/", auth, isAdminOrAssistant, async (req, res) => {
  try {
    const { client, demandeur, observation, type, modeIntervention } = req.body

    // Check if client exists
    const clientExists = await Client.findById(client)

    if (!clientExists) {
      return res.status(404).json({ message: "Client non trouvé" })
    }

    // Check if demandeur exists
    const demandeurExists = await Demandeur.findById(demandeur)

    if (!demandeurExists) {
      return res.status(404).json({ message: "Demandeur non trouvé" })
    }

    // Create new ticket
    const ticket = new Ticket({
      client,
      demandeur,
      observation,
      type,
      modeIntervention,
    })

    await ticket.save()

    // Populate references
    await ticket.populate("client", "nom")
    await ticket.populate("demandeur", "nom prenom")

    res.status(201).json(ticket)
  } catch (error) {
    console.error("Create ticket error:", error)
    res.status(500).json({ message: "Erreur lors de la création du ticket" })
  }
})

// Update ticket status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body

    // Check if ticket exists and user has access
    const query = { _id: req.params.id }
    if (req.user.role === "collaborator") {
      query.collaborateur = req.user._id
    }

    const ticket = await Ticket.findOne(query)

    if (!ticket) {
      return res.status(404).json({ message: "Ticket non trouvé ou accès refusé" })
    }

    // Update ticket status
    ticket.etat = status

    // If status is 'ferme', set resolution date and calculate duration
    if (status === "ferme") {
      ticket.dateResolution = new Date()

      // Calculate duration in hours
      const creationDate = new Date(ticket.date)
      const resolutionDate = new Date(ticket.dateResolution)
      const durationMs = resolutionDate - creationDate
      ticket.duree = Math.round(durationMs / (1000 * 60 * 60))
    }

    await ticket.save()
    res.json(ticket)
  } catch (error) {
    console.error("Update ticket status error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut du ticket" })
  }
})

// Assign collaborator to ticket
router.put("/:id/assign", auth, isAdminOrAssistant, async (req, res) => {
  try {
    const { collaborateurId } = req.body

    // Check if ticket exists
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
      return res.status(404).json({ message: "Ticket non trouvé" })
    }

    // Check if collaborator exists
    const collaborateur = await User.findById(collaborateurId)

    if (!collaborateur || collaborateur.role !== "collaborator") {
      return res.status(404).json({ message: "Collaborateur non trouvé" })
    }

    // Update ticket
    ticket.collaborateur = collaborateurId

    // If ticket is 'ouvert', set it to 'en_cours'
    if (ticket.etat === "ouvert") {
      ticket.etat = "en_cours"
    }

    await ticket.save()

    // Populate references
    await ticket.populate("client", "nom email telephone adresse")
    await ticket.populate("demandeur", "nom prenom email telephone fonction")
    await ticket.populate("collaborateur", "nom prenom specialite")
    await ticket.populate({
      path: "comments.user",
      select: "nom prenom",
    })

    res.json(ticket)
  } catch (error) {
    console.error("Assign collaborator error:", error)
    res.status(500).json({ message: "Erreur lors de l'assignation du collaborateur" })
  }
})

// Add comment to ticket
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { text } = req.body

    // Check if ticket exists and user has access
    const query = { _id: req.params.id }
    if (req.user.role === "collaborator") {
      query.collaborateur = req.user._id
    }

    const ticket = await Ticket.findOne(query)

    if (!ticket) {
      return res.status(404).json({ message: "Ticket non trouvé ou accès refusé" })
    }

    // Add comment
    ticket.comments.push({
      user: req.user._id,
      text,
    })

    await ticket.save()

    // Populate references
    await ticket.populate("client", "nom email telephone adresse")
    await ticket.populate("demandeur", "nom prenom email telephone fonction")
    await ticket.populate("collaborateur", "nom prenom specialite")
    await ticket.populate({
      path: "comments.user",
      select: "nom prenom",
    })

    res.json(ticket)
  } catch (error) {
    console.error("Add comment error:", error)
    res.status(500).json({ message: "Erreur lors de l'ajout du commentaire" })
  }
})

module.exports = router
