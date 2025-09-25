#!/bin/bash

# Buybox Generator Deployment Script
echo "🚀 Starting Buybox Generator deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install functions dependencies
echo "📦 Installing functions dependencies..."
cd functions && npm install && cd ..

# Run tests
echo "🧪 Running tests..."
npm test

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at:"
echo "   - https://your-project-id.web.app"
echo "   - https://your-project-id.firebaseapp.com"
echo ""
echo "📝 To add a custom domain:"
echo "   1. Go to Firebase Console → Hosting"
echo "   2. Click 'Add custom domain'"
echo "   3. Follow the DNS configuration instructions"

