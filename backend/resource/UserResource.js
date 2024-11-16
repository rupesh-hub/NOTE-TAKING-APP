const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const Role = require("../models/RoleModel");
const {Permission, Authority} = require("../models/AuthorityModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@desc REGISTER THE USER
//@route POST /api/v1.0.0/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password, roles } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }

  // Check if email is already taken
  const emailTaken = await User.findOne({ email });
  if (emailTaken) {
    res.status(400);
    throw new Error("Email already taken.");
  }

  // Check if username is already taken
  const usernameTaken = await User.findOne({ username });
  if (usernameTaken) {
    res.status(400);
    throw new Error("Username already taken.");
  }

  // Hash password
  const hashPassword = await bcrypt.hash(password, 10);

  // Assign roles to the user
  let roleIds;
  if (roles) {
    const roleRecords = await Role.find({ name: { $in: roles } });
    roleIds = roleRecords.map((role) => role._id);
  } else {
    const defaultRole = await Role.findOne({ name: "user" });
    roleIds = [defaultRole._id];
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password: hashPassword,
    roles: roleIds,
  });

  // Send response
  if (user) {
    res.status(201).json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("Something went wrong!");
  }
});

//@desc AUTHENTICATE USER
//@route POST /api/v1.0.0/users/authenticate
//@access public
const authenticateUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }

  const user = await User.findOne({ username }).populate("roles");

  //compare password with hash password
  if (user && (await bcrypt.compare(password, user.password))) {
    const access_token = jwt.sign(
      {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      process.env.SECRET_KEY,
      { expiresIn: process.env.TOKEN_EXPIRATION_TIME }
    );
    res.status(200).json({
      access_token: access_token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      },
    });
  } else {
    res.status(400);
    throw new Error("Username or password is not valid!");
  }
});

//@desc CURRENT USER
//@route GET /api/v1.0.0/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

//@desc FILTER USER
//@route GET /api/v1.0.0/users/
//@access private
const filterUser = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const searchTerm = (req.query.search || "").trim();
  const skip = (page - 1) * limit;

  // Build the search filter for first and last name if searchTerm exists
  let searchFilter = {};
  if (searchTerm) {
    searchFilter = {
      $or: [
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },
      ],
    };
  }

  try {
    // Fetch users matching the search filter
    const result = await User.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .select("_id firstName lastName username email");

    // Filter out the logged-in user by comparing IDs
    const filteredUsers = result.filter(
      (user) => user._id.toString() !== req.user._id.toString()
    );

    // Calculate metadata for pagination
    const totalUsers = await User.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users: filteredUsers,
      currentPage: page,
      totalPages,
      totalUsers,
      limit,
    });
  } catch (error) {
    console.error("Error in filterUser:", error);
    res.status(500).json({ message: "An error occurred while fetching users" });
  }
});

//@desc ALL AUTHORITIES
//@route GET /api/v1.0.0/users/authorities
//@access private
const authorities = asyncHandler(async (req, res) => {
  try {
    // Fetch all authorities
    const authorities = await Authority.find({}, "_id name");

    // Format the data to include only _id and name
    const formattedAuthorities = authorities.map((authority) => ({
      _id: authority._id,
      name: authority.name,
    }));

    res.json(formattedAuthorities);
  } catch (error) {
    console.error("Error fetching authorities:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = {
  registerUser,
  authenticateUser,
  currentUser,
  filterUser,
  authorities,
};
