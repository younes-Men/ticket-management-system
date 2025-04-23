const express = require("express")
const Client = require("../models/Client")
const Demandeur = require("../models/Demandeur")
const Ticket = require("../models/Ticket")
const { auth, isAdminOrAssistant } = require("../middleware/auth")
const router = express.Router()

// Get assistant statistics
router.get("/statistics", auth, isAdminOrAssistant, async (req, res) => {
  try {
    // Get counts
    const [totalTickets, openTickets, closedTickets, totalClients, totalDemandeurs] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ etat: { $ne: "ferme" } }),
      Ticket.countDocuments({ etat: "ferme" }),
      Client.countDocuments(),
      Demandeur.countDocuments(),
    ])

    res.json({
      totalTickets,
      openTickets,
      closedTickets,
      totalClients,
      totalDemandeurs,
    })
  } catch (error) {
    console.error("Get assistant statistics error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques" })
  }
})

module.exports = router
