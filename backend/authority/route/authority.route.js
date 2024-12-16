import express from "express";
const router = express.Router();

import {
  createAuthority,
  fetchAuthorities,
  updateAuthority,
  deleteAuthority,
  fetchByName
} from "../controller/authority.controller.js";

router.post("/", createAuthority);
router.get("/", fetchAuthorities);
router.put(
  "/:authorityName",
  updateAuthority
);
router.delete(
  "/:authorityName",
  deleteAuthority
);
router.get("/:name", fetchByName);

export default router;
