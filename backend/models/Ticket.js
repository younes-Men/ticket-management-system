const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const ticketSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  demandeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Demandeur",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  heure: {
    type: String,
    default: () => new Date().toLocaleTimeString(),
  },
  observation: {
    type: String,
    required: true,
  },
  modeIntervention: {
    type: String,
  },
  collaborateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  etat: {
    type: String,
    enum: ["ouvert", "en_cours", "ferme"],
    default: "ouvert",
  },
  type: {
    type: String,
    enum: ["bug", "feature", "support", "autre"],
    default: "bug",
  },
  duree: {
    type: Number,
    default: 0,
  },
  dateResolution: {
    type: Date,
  },
  comments: [commentSchema],
})

const Ticket = mongoose.model("Ticket", ticketSchema)

module.exports = Ticket
