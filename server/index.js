const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const EmployeeModel = require("./models/Employee");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

// mongoose.connect("mongodb://127.0.0.1:27017/employee");
mongoose
  .connect("mongodb://127.0.0.1:27017/employee", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error: ", err));

// Register route
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new employee record
    const newEmployee = new EmployeeModel({
      name,
      email,
      password: hashedPassword, // Store hashed password
    });

    await newEmployee.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Find the user by email
    const user = await EmployeeModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "No record existed" });
    }

    // Compare the entered password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    res.status(200).json({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

app.listen(3001, () => {
  console.log("Server is running");
});
