// // Define a route to retrieve user data for a specific username
// const express = require('express');
// const cors = require('cors');

// const app = express();
// const port = 3200;

// app.use(cors());

// // Dummy user data
// const users = [
//     { username: 'johndoe', email: 'johndoe@example.com', phone: '1234567890' },
//     { username: 'janesmith', email: 'janesmith@example.com', phone: '9876543210' },
//   ];
  
//   app.get('/userdata', (req, res) => {
//     const { username } = req.query;
  
//     // Find user by username
//     const user = users.find((user) => user.username === username);
  
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
  
//     res.json(user);
//   });
  

// app.listen(port, () => {
//   console.log(`User service running on port ${port}`);
// });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3200;

app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://my-mongodb:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });

// Create a user schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  phoneNumber: String,
  homeAddress: String,
});

// Create a user model
const User = mongoose.model('User', userSchema);

app.get('/userdata', async (req, res) => {
  const { username } = req.query;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      username: user.username,
      email: user.email,
      phone: user.phoneNumber,
      address: user.homeAddress,
    };

    res.json(userData);
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Enable pre-flight requests for the userdata endpoint
app.options('/userdata', cors());

app.listen(port, () => {
  console.log(`User service running on port ${port}`);
});



