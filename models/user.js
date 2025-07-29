const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    name: {
    type: String,
    required: [true, "El nombre es obligatorio"],
  },
  email: {
    type: String,
    required: [true, "El email es obligatorio"],
    unique: [true, "El correo ya existe"],
    trim: true
  },
  password: {
    type: String,
    required: [true, "El password es obligatorio"],
  },
  role: {
    type: String,
    enum: ["user"],
    default: "user"
  },
  profileImageUrl: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member"
  }
  }, {
  timestamps: true 
});

const userModel = mongoose.model("User", UserSchema, "user");

module.exports = userModel;