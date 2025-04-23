const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const clientRoutes = require("./routes/clients")
const demandeurRoutes = require("./routes/demandeurs")
const ticketRoutes = require("./routes/tickets")
const collaborateurRoutes = require("./routes/collaborateurs")
const adminRoutes = require("./routes/admin")
const assistantRoutes = require("./routes/assistant")
const collaboratorRoutes = require("./routes/collaborator")

// Load environment variables
dotenv.config()

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ticket-system")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/clients", clientRoutes)
app.use("/api/demandeurs", demandeurRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/collaborateurs", collaborateurRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/assistant", assistantRoutes)
app.use("/api/collaborator", collaboratorRoutes)

// Add a route to create initial admin user without authentication
app.post("/api/setup/initial-admin", async (req, res) => {
  try {
    const User = require("./models/User")
    const { nom, prenom, email, motDePasse } = req.body

    // Check if any admin already exists
    const adminExists = await User.findOne({ role: "admin" })
    if (adminExists) {
      return res.status(400).json({ message: "An admin user already exists" })
    }

    // Create new admin user
    const admin = new User({
      nom,
      prenom,
      email,
      role: "admin",
      motDePasse,
    })

    await admin.save()

    res.status(201).json({
      _id: admin._id,
      nom: admin.nom,
      prenom: admin.prenom,
      email: admin.email,
      role: admin.role,
    })
  } catch (error) {
    console.error("Create initial admin error:", error)
    res.status(500).json({ message: "Error creating initial admin" })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Une erreur est survenue sur le serveur" })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
