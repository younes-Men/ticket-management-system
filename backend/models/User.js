const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
    },
    prenom: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["admin", "assistant", "collaborator"],
      required: true,
    },
    specialite: {
      type: String,
      required: function () {
        return this.role === "collaborator"
      },
    },
    motDePasse: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

userSchema.pre("save", async function (next) {
  if (!this.isModified("motDePasse")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt)
    next()
  } catch (error) {
    next(error)
  }
})


userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.motDePasse)
}

const User = mongoose.model("User", userSchema)

module.exports = User
