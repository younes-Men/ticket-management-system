const express = require("express")
const Ticket = require("../models/Ticket")
const { auth } = require("../middleware/auth")
const router = express.Router()

// Get tickets assigned to collaborator
router.get("/tickets", auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ collaborateur: req.user._id })
      .populate("client", "nom")
      .populate("demandeur", "nom prenom")
      .sort({ date: -1 })

    res.json(tickets)
  } catch (error) {
    console.error("Get collaborator tickets error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des tickets" })
  }
})

// Get specific ticket assigned to collaborator
router.get("/tickets/:id", auth, async (req, res) => {
  try {
    console.log(`Collaborator ${req.user._id} requesting ticket ${req.params.id}`)

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      collaborateur: req.user._id,
    })
      .populate("client", "nom email telephone adresse")
      .populate("demandeur", "nom prenom email telephone fonction")
      .populate("collaborateur", "nom prenom specialite")
      .populate({
        path: "comments.user",
        select: "nom prenom",
      })

    if (!ticket) {
      console.log("Ticket not found or not assigned to this collaborator")
      return res.status(404).json({ message: "Ticket non trouvé ou non assigné à ce collaborateur" })
    }

    console.log("Ticket found and returned to collaborator")
    res.json(ticket)
  } catch (error) {
    console.error("Get collaborator ticket details error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération du ticket" })
  }
})

module.exports = router
