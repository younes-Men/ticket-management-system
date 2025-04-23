const express = require("express")
const User = require("../models/User")
const { auth, isAdminOrAssistant } = require("../middleware/auth")
const router = express.Router()

// Get all collaborateurs
router.get("/", auth, isAdminOrAssistant, async (req, res) => {
  try {
    const collaborateurs = await User.find({ role: "collaborator" })
      .select("_id nom prenom specialite")
      .sort({ nom: 1 })

    res.json(collaborateurs)
  } catch (error) {
    console.error("Get collaborateurs error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des collaborateurs" })
  }
})

module.exports = router
