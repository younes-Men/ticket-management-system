const express = require("express")
const User = require("../models/User")
const Client = require("../models/Client")
const Ticket = require("../models/Ticket")
const { auth, isAdmin } = require("../middleware/auth")
const router = express.Router()




// Get all users
router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-motDePasse").sort({ nom: 1 })

    res.json(users)
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" })
  }
})

// Create new user
router.post("/users", auth, isAdmin, async (req, res) => {
  try {
    const { nom, prenom, email, role, specialite, motDePasse } = req.body

    // Check if user with same email already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" })
    }

    // Create new user
    const user = new User({
      nom,
      prenom,
      email,
      role,
      specialite: role === "collaborator" ? specialite : undefined,
      motDePasse,
    })

    await user.save()

    // Return user without password
    const userResponse = {
      _id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      specialite: user.specialite,
    }

    res.status(201).json(userResponse)
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" })
  }
})

// Get statistics
router.get("/statistics", auth, isAdmin, async (req, res) => {
  try {
    const { period } = req.query
    let dateFilter = {}

    // Set date filter based on period
    if (period) {
      const now = new Date()

      if (period === "week") {
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)
        dateFilter = { date: { $gte: weekStart } }
      } else if (period === "month") {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        dateFilter = { date: { $gte: monthStart } }
      } else if (period === "year") {
        const yearStart = new Date(now.getFullYear(), 0, 1)
        dateFilter = { date: { $gte: yearStart } }
      }
    }

    // Get counts
    const [
      totalTickets,
      openTickets,
      closedTickets,
      totalClients,
      totalDemandeurs,
      totalCollaborateurs,
      ticketsByType,
      topCollaborateurs,
      topClients,
      avgResolutionTime,
    ] = await Promise.all([
      Ticket.countDocuments(dateFilter),
      Ticket.countDocuments({ ...dateFilter, etat: { $ne: "ferme" } }),
      Ticket.countDocuments({ ...dateFilter, etat: "ferme" }),
      Client.countDocuments(),
      Ticket.distinct("demandeur").then((ids) => ids.length),
      User.countDocuments({ role: "collaborator" }),
      Ticket.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Ticket.aggregate([
        { $match: { ...dateFilter, etat: "ferme", collaborateur: { $exists: true } } },
        { $group: { _id: "$collaborateur", ticketsCount: { $sum: 1 } } },
        { $sort: { ticketsCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "collaborateur",
          },
        },
        { $unwind: "$collaborateur" },
        {
          $project: {
            _id: "$collaborateur._id",
            nom: "$collaborateur.nom",
            prenom: "$collaborateur.prenom",
            specialite: "$collaborateur.specialite",
            ticketsCount: 1,
          },
        },
      ]),
      Ticket.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$client", ticketsCount: { $sum: 1 } } },
        { $sort: { ticketsCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "clients",
            localField: "_id",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: "$client" },
        {
          $project: {
            _id: "$client._id",
            nom: "$client.nom",
            ticketsCount: 1,
          },
        },
      ]),
      Ticket.aggregate([
        { $match: { ...dateFilter, etat: "ferme", duree: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, avgDuration: { $avg: "$duree" } } },
      ]).then((result) => (result.length > 0 ? Math.round(result[0].avgDuration) : 0)),
    ])

    // Format ticket types for percentage calculation
    const formattedTicketTypes = ticketsByType.map((type) => {
      const typeNames = {
        bug: "Bug",
        feature: "Fonctionnalité",
        support: "Support",
        autre: "Autre",
      }

      return {
        name: typeNames[type._id] || type._id,
        count: type.count,
        percentage: Math.round((type.count / totalTickets) * 100) || 0,
      }
    })

    res.json({
      totalTickets,
      openTickets,
      closedTickets,
      totalClients,
      totalDemandeurs,
      totalCollaborateurs,
      ticketsByType: formattedTicketTypes,
      topCollaborateurs,
      topClients,
      avgResolutionTime,
    })
  } catch (error) {
    console.error("Get statistics error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques" })
  }
})

module.exports = router
