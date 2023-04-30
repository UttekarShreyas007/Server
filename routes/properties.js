// Import required modules and packages
const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const agentMiddleware = require("../middleware/agentMiddleware");

// Route for creating a new property
router.post("/create", auth, async (req, res) => {
  console.log("dhsl", req.userId);
  try {
    const { title, address, price, type, description, location, image } =
      req.body;
    const property = new Property({
      title,
      address,
      price,
      type,
      description,
      location,
      image,
      agent: req.userId,
    });
    await property.save();
    res.status(201).send({ property });
  } catch (error) {
    console.log(error, "shry");
    res.status(400).send({ error: error.message });
  }
});

// Route for updating a property
router.patch("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, address, price, type, description, location, image } =
      req.body;
    const property = await Property.findOne({ _id: id, agent: req.userId });
    if (!property) {
      return res.status(404).send();
    }
    if (title) {
      property.title = title;
    }
    if (address) {
      property.address = address;
    }
    if (price) {
      property.price = price;
    }
    if (type) {
      property.type = type;
    }
    if (location) {
      property.location = location;
    }
    if (description) {
      property.description = description;
    }
    if (image) {
      property.image = image;
    }
    await property.save();
    res.send({ property });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error.message });
  }
});

// Route for deleting a property
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findOneAndDelete({
      _id: id,
      agent: req.userId,
    });
    if (!property) {
      return res.status(404).send();
    }
    res.send({ property });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

// Route for retrieving all properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().populate("agent", "name email");
    res.send({ properties });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

// // GET all clients that have shown interest in properties
router.get("/clients", async (req, res) => {
  try {
    // Get agent id from request
    const agentId = req.userId;

    // Find all properties listed by the agent
    const properties = await Property.find({ agent: agentId });
    console.log(properties, "proesvbsvb");

    // Get interested clients for each property
    let clients = [];
    for (let i = 0; i < properties.length; i++) {
      const interestedUsers = await User.find(
        { _id: { $in: properties[i].interestedUsers } },
        "name email"
      );
      interestedUsers.forEach((user) => {
        clients.push({
          id: user._id,
          property: properties[i].title,
          name: `${user.name}`,
          email: user.email,
        });
      });
    }
    clients.sort((a, b) => a.name.localeCompare(b.name));
    // Send response
    res.send(clients);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Get list of properties a client is interested in
router.get("/interested", async (req, res) => {
  try {
    const clientId = req.userId;
    console.log(clientId, "Cid");
    const user = await User.findById(clientId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const interestedProperties = user.interestedProperties;
    console.log(interestedProperties, "intp");
    const properties = await Property.find({
      _id: { $in: interestedProperties },
    });
    res.json(properties);
  } catch (err) {
    console.log("bsdcvsvvbdakvbnvbhv73t2572t8u45////////////////////", err);
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Route for retrieving a single property by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id).populate(
      "agent",
      "name email"
    );
    if (!property) {
      return res.status(404).send();
    }
    res.send({ property });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

// GET all properties listed by a particular agent
router.get("/agent/:agentId", agentMiddleware, async (req, res) => {
  console.log(req.params.agentId, "agentid");
  try {
    const properties = await Property.find({ agent: req.params.agentId });

    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Export the router
module.exports = router;
