// E-commerce/functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// --- IMPORTANT: Replace with your actual Stripe Secret Key ---
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const db = admin.firestore();

// Define allowed origins for your frontend
const allowedOrigins = [
  'http://localhost:5173', // For local Vite development
  'https://e-commerce-77358.web.app', // Your deployed Firebase Hosting domain
  'https://e-commerce-77358.firebaseapp.com' // Firebase's other default domain (optional)
];

// --- Helper function for CORS headers (DRY principle) ---
const setCorsHeaders = (response, requestOrigin) => {
    if (allowedOrigins.includes(requestOrigin)) {
        response.set('Access-Control-Allow-Origin', requestOrigin);
    }
    response.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'); // Allow GET for updateProfile if needed, typically POST for data
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.set('Access-Control-Max-Age', '3600');
};

// --- Helper for Manual Token Verification (DRY principle) ---
const verifyAuthToken = async (request, response) => {
    const authorizationHeader = request.headers.authorization;
    let idToken = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        idToken = authorizationHeader.split('Bearer ')[1];
    }

    if (!idToken) {
        console.error("HTTP Function: Authorization header or ID token missing.");
        response.status(401).json({ success: false, error: "Authentication required." });
        return null; // Return null if verification fails
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        return decodedIdToken.uid; // Return UID if successful
    } catch (tokenVerificationError) {
        console.error("HTTP Function: Manual Token Verification Failed. Error:", tokenVerificationError);
        response.status(401).json({ success: false, error: "Authentication failed: Invalid token." });
        return null; // Return null if verification fails
    }
};

// --- Standard HTTP function for Payment Processing ---
exports.processPaymentAndCreateOrder = functions.https.onRequest(async (request, response) => {
    // Set CORS headers (use helper)
    setCorsHeaders(response, request.headers.origin);

    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
        return response.status(204).send('');
    }

    console.log("Cloud Function Invoked (HTTP Request). Headers:", request.headers);
    console.log("Cloud Function Invoked. Request Body:", request.body);

    // --- Manual Token Verification (use helper) ---
    const userId = await verifyAuthToken(request, response);
    if (!userId) { // If userId is null, response was already sent by verifyAuthToken
        return;
    }
    // --- END Manual Token Verification ---

    // 2. Extract Data from Client (from request.body for HTTP function)
    const { paymentMethodId, cartItems: clientCartItems, shippingInfo, totalAmount: clientTotalAmount } = request.body;

    if (!paymentMethodId || !clientCartItems || clientCartItems.length === 0 || !shippingInfo || !shippingInfo.name) {
        return response.status(400).json({ success: false, error: "Missing required payment or cart details." });
    }

    try {
        let validatedTotalAmount = 0;
        const processedOrderItems = [];

        await db.runTransaction(async (transaction) => {
            for (const item of clientCartItems) {
                if (!item.id || !item.quantity || item.quantity <= 0) {
                    return Promise.reject(new functions.https.HttpsError('invalid-argument', `Invalid item in cart: ${item.id}`));
                }
                const productRef = db.collection('products').doc(item.id);
                const productSnap = await transaction.get(productRef);
                if (!productSnap.exists) {
                    return Promise.reject(new functions.https.HttpsError('not-found', `Product not found: ${item.name || item.id}`));
                }
                const productData = productSnap.data();
                if (productData.stock < item.quantity) {
                    return Promise.reject(new functions.https.HttpsError('unavailable', `Product ${productData.name} is out of stock or ` + `requested quantity (${item.quantity}) ` + `exceeds available stock (${productData.stock}).`));
                }
                const itemPrice = productData.price;
                validatedTotalAmount += itemPrice * item.quantity;
                processedOrderItems.push({
                    productId: item.id, name: productData.name, priceAtOrder: itemPrice, imageUrl: productData.imageUrl, quantity: item.quantity,
                });
                transaction.update(productRef, { stock: productData.stock - item.quantity });
            }

            if (Math.abs(validatedTotalAmount - clientTotalAmount) > 0.01) {
                console.warn(`Client total (${clientTotalAmount}) differs from ` + `server calculated total (${validatedTotalAmount}). ` + `Using server total.`);
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(validatedTotalAmount * 100),
                currency: 'usd', // IMPORTANT: Set your currency here (e.g., 'usd', 'inr')
                payment_method: paymentMethodId,
                confirm: true,
                off_session: true,
                description: `Order from e-commerce-77358 for user ${userId}`,
                metadata: {
                    userId: userId,
                    cartTotal: validatedTotalAmount,
                    items: JSON.stringify(processedOrderItems.map(
                        (item) => ({ id: item.productId, qty: item.quantity })
                    )),
                },
            });

            if (paymentIntent.status !== 'succeeded') {
                return Promise.reject(new functions.https.HttpsError('aborted', `Stripe payment failed with status: ${paymentIntent.status}`, paymentIntent.last_payment_error));
            }

            const orderRef = db.collection('orders').doc();
            transaction.set(orderRef, {
                userId: userId, items: processedOrderItems, totalAmount: validatedTotalAmount, orderDate: admin.firestore.FieldValue.serverTimestamp(), status: 'processing', paymentStatus: 'paid', paymentIntentId: paymentIntent.id,
            });

            const cartDocRef = db.collection('carts').doc(userId);
            transaction.delete(cartDocRef);

            return response.status(200).json({
                success: true, orderId: orderRef.id, paymentStatus: paymentIntent.status, totalAmount: validatedTotalAmount,
            });
        }); // End of db.runTransaction
    } catch (error) { // Catch block for the entire function logic
        console.error('Cloud Function Error during payment/order process:', error);
        if (error instanceof functions.https.HttpsError) {
            // Map HttpsError to appropriate HTTP status codes
            const statusCode = (error.code === 'invalid-argument' || error.code === 'not-found' || error.code === 'unavailable') ? 400 : 500;
            return response.status(statusCode).json({ success: false, error: error.message, details: error.details });
        } else if (error.type === 'StripeCardError' || error.type === 'StripeInvalidRequestError') {
            return response.status(402).json({ success: false, error: error.message || 'Payment failed due to invalid card details.', details: error.raw });
        } else {
            return response.status(500).json({ success: false, error: 'An unexpected error occurred during the order process.', details: error.message });
        }
    }
}); // End of exports.processPaymentAndCreateOrder function

// --- NEW: HTTP Function to Update User Profile ---
exports.updateUserProfile = functions.https.onRequest(async (request, response) => {
    // Set CORS headers (use helper)
    setCorsHeaders(response, request.headers.origin);

    if (request.method === 'OPTIONS') {
        return response.status(204).send('');
    }

    console.log("Cloud Function updateUserProfile invoked.");
    // Manual Token Verification (use helper)
    const userId = await verifyAuthToken(request, response);
    if (!userId) { // If userId is null, response was already sent by verifyAuthToken
        return;
    }

    // Extract displayName from request body
    const { displayName } = request.body;

    if (!displayName) {
        return response.status(400).json({ success: false, error: "Display name is required." });
    }

    try {
        // Use admin.auth() to update the user's profile
        await admin.auth().updateUser(userId, { displayName: displayName });

        // Optional: Update Firestore user document as well if needed (e.g. for consistency)
        // This is done on Signup.jsx and ProfilePage.jsx directly
        // const userDocRef = db.collection('users').doc(userId);
        // await userDocRef.update({ displayName: displayName });

        console.log(`User ${userId} display name updated to: ${displayName}`);
        return response.status(200).json({ success: true, message: "Profile updated successfully.", displayName: displayName });
    } catch (error) {
        console.error("updateUserProfile: Error updating user profile:", error);
        return response.status(500).json({ success: false, error: "Failed to update profile.", details: error.message });
    }
});
