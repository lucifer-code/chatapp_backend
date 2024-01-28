const express = require("express");
const mongoose = require("mongoose");
const expressAsyncHandler = require("express-async-handler");

const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const loginController = expressAsyncHandler(async (req, res) => {
  const { name, password } = req.body;

  const user = await User.findOne({ name });

  if (user && (await user.matchPassword(password))) {
    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    };
    res.json(response);
  } else {
    res.status(401);
    throw new Error("Invalid Username or Password");
  }
});

const registerController = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  //Check for all fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All input fields must be provided.");
  }

  //pre-existing user
  const existingEmailUser = await User.findOne({ email });
  if (existingEmailUser) {
    res.status(405);
    throw new Error("User already exists, Please try another email.");
  }

  //userName already taken
  const existingUsername = await User.findOne({ name });
  if (existingUsername) {
    res.status(406);
    throw new Error("User already exists, Please try another name.");
  }

  //create a user in the DB
  const newUser = await User.create({ name, email, password });
  if (newUser) {
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      token: generateToken(newUser._id),
    });
  } else {
    res.status(400);
    throw new Error("Registration couldn't be completed");
  }
});

const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  //keyword => if any of the users email or name includes searched text (case insensitive) it will retrn it

  const users = await User.find(keyword).find({
    _id: { $ne: req.user._id },
    //return users except yourself
  });
  res.send(users);
});

module.exports = {
  loginController,
  registerController,
  fetchAllUsersController,
};
