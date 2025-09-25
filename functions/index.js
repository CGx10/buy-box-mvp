const functions = require('firebase-functions');
const app = require('../server'); // Import our Express app

// Load environment variables
require('dotenv').config();

// Export the Express app as a Firebase Cloud Function
exports.app = functions.https.onRequest(app);
