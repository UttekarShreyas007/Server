const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");

const router = express.Router();

// User signup route
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "1d",
    });
    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    next(error);
  }
});

// User login route
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    user.comparePassword(password, function (err, isMatch) {
      if (err) throw err;
      if (!isMatch) {
        return res.status(401).json({ message: "Authentication failed" });
      }
      const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
        expiresIn: "1d",
      });
      const userObj = {
        name: user.name,
        email: user.email,
        _id: user._id,
        role: user.role,
      };
      req.session.token = token;
      res.cookie("token", token, {
        maxAge: 36000000,
        sameSite: "none",
        secure: true,
        httpOnly: false,
      });
      res.send({ message: "Login success", userObj, token: token });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
