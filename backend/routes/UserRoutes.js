const express = require("express");
const {
  registerUser,
  authenticateUser,
  currentUser,
  filterUser,
  authorities
} = require("../resource/UserResource");

const { authenticate, checkPermission } = require('../middleware/AuthMiddleware');

const router = express.Router();

router.post("/register", registerUser);

router.post("/authenticate", authenticateUser);

router.get("/current", authenticate, currentUser);

router.get("/filter", authenticate, filterUser);

router.get("/authorities", authenticate, authorities);

module.exports = router;
