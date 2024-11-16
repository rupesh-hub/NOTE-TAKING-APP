const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
});

const authoritySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
});

const Permission = mongoose.model("Permission", permissionSchema);
const Authority = mongoose.model("Authority", authoritySchema);

module.exports = { Permission, Authority };
