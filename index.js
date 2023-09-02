const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/crud", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// user schema
const userSchema = new mongoose.Schema({
  name: String,
  phoneNumber: Number,
  city: String,
});

const User = mongoose.model("User", userSchema);

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

// post method
app.post("/users", async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({
      message: "User created successfully",
      newUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating user" });
  }
});

// Get method
app.get("/users", verifyJWT, async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      message: "User retrieve successfully",
      users,
    });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving users" });
  }
});

// retrieving specific user by id
app.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving user" });
  }
});

// Update method
app.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      message: "User update successfully",
      updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
});

// Delete method
app.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndRemove(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      message: "User deleted successfully",
      deletedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello From crud!");
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
