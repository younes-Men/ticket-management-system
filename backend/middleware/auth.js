const jwt = require("jsonwebtoken")
const User = require("../models/User")


const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Authentification requise" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" })
    }

    req.user = user
    req.token = token
    next()
  } catch (error) {
    res.status(401).json({ message: "Veuillez vous authentifier" })
  }
}


const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé" })
  }
  next()
}


const isAdminOrAssistant = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "assistant") {
    return res.status(403).json({ message: "Accès refusé" })
  }
  next()
}

const isCollaborator = (req, res, next) => {
  if (req.user.role !== "collaborator") {
    return res.status(403).json({ message: "Accès refusé" })
  }
  next()
}

module.exports = { auth, isAdmin, isAdminOrAssistant, isCollaborator }
