const mongoose = require("mongoose")

const clientSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  adresse: {
    type: String,
    required: true,
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
})

const Client = mongoose.model("Client", clientSchema)

module.exports = Client
