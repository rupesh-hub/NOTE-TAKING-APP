const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstName: { type: String, required: [true, "First name is required!"] },
    lastName: { type: String, required: [true, "Last name is required!"] },
    username: {
      type: String,
      required: [true, "Username is required!"],
      unique: [true, "Username already taken. Please try new one!!"],
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: [true, "Email already taken !!"],
    },
    password: { type: String, required: [true, "Password is required!"] },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
