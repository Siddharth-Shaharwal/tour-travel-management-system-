#!/bin/bash
# Travel Management System - Quick Start Script

echo "🚀 Starting Travel Management System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Start Backend
echo "📦 Starting Backend Server..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
fi
echo "🟢 Backend running on http://localhost:4000"
node server.js &
BACKEND_PID=$!
sleep 2

# Start Frontend
echo ""
echo "⚛️  Starting Frontend Server..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
fi
echo "🟢 Frontend running on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!
sleep 3

# Open browser
echo ""
echo "✅ All servers running!"
echo ""
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend API: http://localhost:4000"
echo "📍 Admin Dashboard: http://localhost:5173/admin"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
