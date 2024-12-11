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
    profile: { 
      type: String,
      default: null 
    },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        // Add full URL for profile image when converting to JSON
        if (ret.profile) {
          ret.profile = `${process.env.API_BASE_URL}/uploads/${ret.profile}`;
        }
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("User", userSchema);