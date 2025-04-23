const express = require("express")
const User = require("../models/User")
const { auth } = require("../middleware/auth")
const router = express.Router()

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      nom: req.user.nom,
      prenom: req.user.prenom,
      email: req.user.email,
      role: req.user.role,
      specialite: req.user.specialite,
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" })
  }
})

// Update user profile
router.put("/me", auth, async (req, res) => {
  try {
    const updates = {}
    const allowedUpdates = ["nom", "prenom", "email"]

    // Only allow certain fields to be updated
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key]
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })

    res.json({
      _id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      specialite: user.specialite,
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" })
  }
})

// Change password
router.put("/me/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Check current password
    const isMatch = await req.user.comparePassword(currentPassword)

    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" })
    }

    // Update password
    req.user.motDePasse = newPassword
    await req.user.save()

    res.json({ message: "Mot de passe mis à jour avec succès" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ message: "Erreur lors du changement de mot de passe" })
  }
})

module.exports = router
