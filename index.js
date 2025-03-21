require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.json()); // To parse JSON in the request body

// Database connection
const PORT = process.env.PORT || 5000;  // Default to port 5000 if not set
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((error) => console.log("Error connecting to MongoDB:", error.message));

// Schema Definitions
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pincode: { type: String, required: true },
  address: { type: String, required: true }, 
  gmapLink: { type: String, required: false },
});

const userDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  mobileNumber:{ type: String, required: true },
  email:{ type: String, required: true },
  password: { type: String, required: true },
});

// Models
const ServiceDetails = mongoose.model('servicedetails', itemSchema);
const UserDetails = mongoose.model('userdetails', userDetailsSchema);


app.get('/api/servicedetails', async (req, res) => {
  try {
    const items = await ServiceDetails.find({});
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching items", error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email)

  if (!email || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    // Authenticate user
    const user = await UserDetails.findOne({ email });
    console.log("password from DB",user)

    if (!email || user.password !== password) {
      return res.status(401).json({ message: 'Invalid name or password.' });
    }

    res.status(200).json({ message: 'Login successful', user: { email } });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ message: 'Error processing request', error: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { name,mobileNumber,email, password } = req.body;

  // Check if username and password are provided
  if (!name || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    // Check if the username already exists
    const existingUser = await UserDetails.findOne({ name });
    if (existingUser) {
      return res.status(409).json({ message: "Failed to add user: Username already exists." });
    }

    // Create and save the new user
    const newUser = new UserDetails({ name,mobileNumber,email, password });
    await newUser.save();

    // Respond with success
    res.status(201).json({ message: 'User added successfully.' });
  } catch (err) {
    // Log a specific error message
    console.error('Error details:', err);
    res.status(500).json({ message: `Failed to add user: An unexpected error occurred.`, error: err.message });
  }
});




app.post('/api/addservice', async (req, res) => {
  const { name, address, pincode, gmapLink } = req.body;

  if (!name || !address || !pincode || !gmapLink) {
    return res.status(400).json({ message: 'All fields are required.', name,address,pincode,gmapLink});
  }

  try {
    const newService = new ServiceDetails({
      name,
      pincode,
      address,
      gmapLink,
    });
    await newService.save();

    res.status(201).json({ message: 'Service added successfully.', service: newService });
  } catch (err) {
    console.error('Error adding service:', err);
    res.status(500).json({ message: 'Failed to add service.', error: err.message });
  }
});

app.post('/api/getservice', async (req, res) => {
  const { pincode, selectedService } = req.body;

  if (!pincode || !selectedService) {
    return res.status(400).json({ message: "Pincode and selected service fields are required." });
  }

  try {
    const filteredServices = await ServiceDetails.find({
      pincode: pincode,
      serviceType: selectedService.toLowerCase(),
    });

    res.status(200).json({ filteredServices });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ message: 'Error processing request', error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
