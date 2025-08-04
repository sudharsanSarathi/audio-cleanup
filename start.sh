#!/bin/bash

echo "🎵 AudioClean Pro - Audio & Video Noise Removal SaaS"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it to add your API keys if needed."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads processed

# Start the application
echo "🚀 Starting AudioClean Pro..."
echo "📍 Application will be available at: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

npm start 