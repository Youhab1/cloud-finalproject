const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 3700;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://inventory-mongodb:27017/inventorydb', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to inventory MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to inventory MongoDB:', error);
    process.exit(1);
  });

// Create a Product schema
const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String,
  type: String,
  price: Number,
  details: String,
  metal: String,
  grams: String,
  photo: String 
});

// Create a Product model
const Product = mongoose.model('Product', productSchema);

let cartItems = [];

// Add CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


// Add item to cart
app.post('/cart/addtocart', (req, res) => {
  const { productId, productName, price } = req.body;

  if (!productId || !productName || !price) {
    return res.status(400).json({ error: 'Invalid request. Please provide productId, productName, and price.' });
  }

  const item = {
    productId,
    productName,
    price,
  };

  cartItems.push(item);
  res.json({ message: 'Item added to cart successfully.' });
});

// Remove item from cart
app.post('/cart/removefromcart', (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Invalid request. Please provide productId.' });
  }

  const index = cartItems.findIndex((item) => item.productId === productId);
  if (index !== -1) {
    cartItems.splice(index, 1);
    return res.json({ message: 'Item removed from cart successfully.' });
  }

  res.json({ message: 'Item not found in the cart.' });
});

// Get cart items
app.get('/cart/cartlist', (req, res) => {
  res.json({
    cartItems,
    total: calculateTotalPrice(cartItems),
  });
});

// Checkout endpoint
app.post('/cart/checkout', (req, res) => {
  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'No items in the cart.' });
  }

  const totalPrice = calculateTotalPrice(cartItems);

  const order = {
    items: cartItems,
    totalPrice,
    paymentMethod: 'Cash on Delivery',
    orderNumber: generateOrderNumber(),
  };

  res.json({ message: 'Checkout processed successfully.', order });
});

// Helper function to calculate total price
function calculateTotalPrice(items) {
  let total = 0;
  for (const item of items) {
    total += item.price;
  }
  return total;
}

// Helper function to generate order number
function generateOrderNumber() {
  return Math.floor(Math.random() * 1000000);
}

const appDir = path.dirname(require.main.filename);

// Serve the cart HTML page
app.get('/cart', (req, res) => {
  res.sendFile(path.join(appDir, 'cart.html'));
});

// Serve product images
app.use('/products/images', express.static(path.join(appDir, 'images')));

app.get('/inventory/products', async (req, res) => {
  try {
    const products = await Product.find({});
    const formattedProducts = products.map((product) => {
      const formattedProduct = {
        name: product.name,
        price: product.price,
      };

      // Include the 'photo' field if it exists
      if (product.photo) {
        formattedProduct.photo = product.photo;
      }

      return formattedProduct;
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred while fetching products.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});





