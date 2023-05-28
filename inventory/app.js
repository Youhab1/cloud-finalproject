

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3400;

app.use(cors());

// Connect to the inventory MongoDB
mongoose.connect('mongodb://inventory-mongodb:27017/inventorydb', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to inventory MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to inventory MongoDB:', error);
    process.exit(1);
  });

// Create a product schema
const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String,
  type: String,
  price: Number,
  details: String,
  metal: String,
  grams: String,
  photo: String // Store the photo URL as a string
});

// Create a product model
const Product = mongoose.model('Product', productSchema);

// Route to retrieve all products with optional filtering
app.get('/inventory/products', async (req, res) => {
  const { category, minPrice, maxPrice, type } = req.query;

const query = {};

if (category) {
  query.category = category;
}
if (type) {
  query.type = type;
}
if (minPrice && maxPrice) {
  query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
} else if (minPrice) {
  query.price = { $gte: Number(minPrice) };
} else if (maxPrice) {
  query.price = { $lte: Number(maxPrice) };
}


  try {
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    console.error('Failed to retrieve products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to search for products by keyword
app.get('/inventory/search', async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  const query = {
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { category: { $regex: keyword, $options: 'i' } },
    ],
  };

  try {
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    console.error('Failed to search products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to retrieve product details by ID
app.get('/inventory/details/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const product = await Product.findOne({ id: id });
    res.json(product);
  } catch (error) {
    console.error('Failed to retrieve product details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Inventory server is running on port ${port}`);
});






