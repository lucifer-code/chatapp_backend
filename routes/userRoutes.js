const express = require("express");

const {
  loginController,
  registerController,
  fetchAllUsersController,
} = require("../controllers/userController.js");
const { protect } = require("../middleware/authMiddleware.js");

const Router = express.Router();

Router.post("/login", loginController);

Router.post("/register", registerController);

Router.get("/fetchUsers", protect, fetchAllUsersController);

module.exports = Router;
