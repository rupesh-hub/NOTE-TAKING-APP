import mongoose from "mongoose";
import { Permission } from "./permission.model.js";

const { Schema } = mongoose;

const authoritySchema = new Schema({
  name: { type: String, required: true },
  permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
});

export const Authority = mongoose.model("Authority", authoritySchema);