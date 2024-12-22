const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/talent_match", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => {
      console.error("Error connecting to MongoDB:", err);
      process.exit(1);
  });

// User Schema (Updated with all required fields)
const UserSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    softSkills: { type: [String], required: true },
    technicalSkills: { type: [String], required: true },
    workExperience: { type: Number, required: true },
    previousJobs: { type: String, required: true },
    referenceLetters: { type: String }, // Optional
    projects: { type: String, required: true },
    hackathons: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// Register Route 
app.post('/register', async (req, res) => {
    console.log("Received registration data:", req.body);
    const {
      fullname,
      email,
      password,
      phone,
      softSkills,
      technicalSkills,
      workExperience,
      previousJobs,
      referenceLetters,
      projects,
      hackathons,
    } = req.body;
  
    // Check if required fields are present
    if (
      !fullname ||
      !email ||
      !password ||
      !phone ||
      !softSkills ||
      !technicalSkills ||
      !workExperience ||
      !previousJobs ||
      !projects ||
      !hackathons
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password before saving it
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save the new user to the database
      const newUser = new User({
        fullname,
        email,
        password: hashedPassword,
        phone,
        softSkills,
        technicalSkills,
        workExperience,
        previousJobs,
        referenceLetters,
        projects,
        hackathons,
      });
      await newUser.save();
  
      console.log('User registered successfully:', newUser); // For debugging
      res.json({ message: 'User registered successfully!' });
    } catch (err) {
      console.error('Error saving user to database:', err); // Log any errors
      res.status(500).json({ message: 'Internal server error' });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User does not exist." });
        }

        // Compare password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password!" });
        }

        // Send success message if login is successful
        res.status(200).json({ message: "Login successful!" });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Start Server
const PORT = 5500;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
