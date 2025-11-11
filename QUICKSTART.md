# CarVista - Quick Start Guide

## Prerequisites

Before starting, make sure you have:

- ✅ Node.js (v14+) installed
- ✅ MongoDB installed and running (or MongoDB Atlas account)
- ✅ Git installed

## Quick Start

### Step 1: Install MongoDB (if not already installed)

Download and install from: https://www.mongodb.com/try/download/community

Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Step 2: Start MongoDB

**Windows:**

```cmd
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

Or just ensure MongoDB service is running in Windows Services.

### Step 3: Start Backend Server

Open a terminal in VS Code and run:

```cmd
cd server
npm run dev
```

You should see:

```
✅ MongoDB Connected
🚀 Server running on port 5000
```

### Step 4: Start Frontend (in a NEW terminal)

Open a new terminal in VS Code (Terminal → New Terminal) and run:

```cmd
cd client
npm start
```

Your browser should automatically open to http://localhost:3000

## Default Configuration

### Backend (server/.env)

- Port: 5000
- MongoDB: mongodb://localhost:27017/carvista
- JWT Secret: (already set)

### Frontend (client/.env)

- Port: 3000 (default)
- API URL: http://localhost:5000/api

## Project Features

### Public Pages (No Login Required)

- 🏠 Home Page - Browse all cars
- 🔍 Search & Filter - Find cars by brand, body type, fuel, price
- 📄 Car Details - View full specifications

### Protected Pages (Login Required)

- ➕ Add Car - Create new listings
- 👤 Profile - View and manage your listings
- 🗑️ Delete - Remove your car listings

## Test the Application

1. **Visit Home Page**: http://localhost:3000
2. **Sign Up**: Click "Sign Up" and create an account
3. **Add a Car**: After login, click "Add Car" in navigation
4. **View Profile**: Click "Profile" to see your listings

## API Testing with Thunder Client/Postman

### Register User

```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "+91 1234567890"
}
```

### Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Get All Cars

```
GET http://localhost:5000/api/cars
```

## Troubleshooting

### MongoDB Connection Error

**Problem**: `MongoServerError: connect ECONNREFUSED`

**Solution**:

1. Make sure MongoDB is running
2. Check MongoDB connection string in `server/.env`
3. Try: `mongodb://127.0.0.1:27017/carvista` instead of localhost

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use`

**Solution**:

1. Kill the process using the port
2. Or change PORT in `server/.env` and `client/.env`

### React Not Starting

**Problem**: npm start fails in client directory

**Solution**:

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Run `npm start`

## Development Tips

### Hot Reload

- Backend: Using nodemon (auto-restarts on changes)
- Frontend: React hot reload (auto-updates on save)

### Add Sample Data

After starting the server, you can add cars through the UI or use the API to bulk insert test data.

### VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- Thunder Client (API testing)

## Next Steps

1. ✅ Project is set up and running
2. 📝 Customize the UI/styling as needed
3. 🎨 Add your own car images
4. 🚀 Deploy to production (Vercel + MongoDB Atlas)

## Need Help?

Check the main README.md for detailed documentation about:

- API endpoints
- Database schema
- Deployment instructions
- Project structure
