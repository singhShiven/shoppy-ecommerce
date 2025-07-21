// E-commerce/scripts/addProducts.js

const admin = require('firebase-admin');

// --- IMPORTANT: Replace './serviceAccountKey.json' with the actual path to your downloaded JSON key ---
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const sampleProducts = [
  {
    name: "Luxury Leather Handbag",
    description: "Crafted from premium Italian leather, this elegant handbag offers timeless style and spacious compartments. Perfect for any occasion.",
    price: 299.99,
    stock: 50,
    category: "Accessories",
    imageUrl: "https://via.placeholder.com/150/8B5CF6/FFFFFF?text=Handbag", // Placeholder image
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: "Wireless Headphones Pro",
    description: "Immerse yourself in rich, clear sound with these noise-cancelling wireless headphones. Ergonomic design for all-day comfort.",
    price: 199.99,
    stock: 120,
    category: "Electronics",
    imageUrl: "https://via.placeholder.com/150/FB923C/FFFFFF?text=Headphones", // Placeholder image
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: "Minimalist Smartwatch",
    description: "Stay connected and track your fitness with this sleek, minimalist smartwatch. Featuring long battery life and comprehensive health monitoring.",
    price: 149.99,
    stock: 80,
    category: "Wearables",
    imageUrl: "https://via.placeholder.com/150/8B5CF6/FFFFFF?text=Smartwatch", // Placeholder image
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: "Premium White Sneakers",
    description: "Step up your style game with these premium white sneakers. Crafted for comfort and designed for urban explorers.",
    price: 129.00,
    stock: 100,
    category: "Footwear",
    imageUrl: "https://via.placeholder.com/150/FB923C/FFFFFF?text=Sneakers", // Placeholder image
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    // Corrected syntax for this object
    name: "Ergonomic Office Chair",
    description: "Experience ultimate comfort and support with this adjustable ergonomic office chair, designed for long hours of productivity.",
    price: 349.99, // Corrected: Removed extra quote
    stock: 30,
    category: "Furniture",
    imageUrl: "https://via.placeholder.com/150/8B5CF6/FFFFFF?text=Chair",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    // Corrected syntax for this object
    name: "Vintage Leather Wallet",
    description: "A classic bifold wallet made from genuine vintage leather, offering durability and timeless style with multiple card slots.",
    price: 49.00,
    stock: 200,
    category: "Accessories",
    imageUrl: "https://via.placeholder.com/150/FB923C/FFFFFF?text=Wallet",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function addSampleProducts() {
  console.log("Adding sample products to Firestore...");
  for (const product of sampleProducts) {
    try {
      // Use add() to let Firestore generate document ID
      const docRef = await db.collection('products').add(product);
      console.log(`Added product: ${product.name} with ID: ${docRef.id}`);
    } catch (error) {
      console.error(`Error adding product ${product.name}:`, error);
    }
  }
  console.log("All sample products added!");
}

addSampleProducts().then(() => {
  console.log("Script finished successfully.");
  process.exit(0); // Exit the script successfully
}).catch(error => {
  console.error("Script failed:", error);
  process.exit(1); // Exit with an error code
});