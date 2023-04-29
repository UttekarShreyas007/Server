const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Property = require("../models/Property");

// Route for creating a new user
router.post("/users", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user with the given email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }
    // Create a new user object
    user = new User({
      name,
      email,
      password,
    });
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    // Save the user to the database
    await user.save();
    // Generate a JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 3600,
    });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Route for updating a user's profile
router.put("/users/me", auth, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    // Update user object
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Route for deleting a user
router.delete("/users/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    await user.remove();
    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/markinterested/:propertyId", async (req, res) => {
  const { propertyId } = req.params;
  const userId = req.userId
  console.log(userId, 'useiod')
  try {
    // Find the user and property in the database
    const user = await User.findById(userId);
    const property = await Property.findById(propertyId);

    // Add the property to the user's interested properties array
    user.interestedProperties.push(propertyId);
    await user.save();

    // Add the user to the properties interested users array
    property.interestedUsers.push(userId);
    await property.save();

    res.status(200).json({ message: "Property marked as interested" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error marking property as interested" });
  }
});

module.exports = router;
