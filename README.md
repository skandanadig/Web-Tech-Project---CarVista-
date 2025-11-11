# CarVista 🚗

A full-stack web application for discovering and listing cars with detailed specifications and pricing information in Bengaluru.

## Features

### For All Users

- 🏠 **Home Page**: Browse all car listings with advanced search and filter options
- 🚘 **Car Details**: View comprehensive information about each car including specifications and seller contact
- 🔍 **Search & Filter**: Search by brand/model and filter by body type, fuel type, transmission, and price range

### For Registered Users

- 🧑‍💻 **Authentication**: Secure login and signup with email/password
- ➕ **Add Car Listing**: Create custom car listings with detailed specifications
- 👤 **Profile Page**: Manage your listings and view your profile information
- 🗑️ **Delete Listings**: Remove your car listings

## Tech Stack

### Frontend

- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Project Structure

```
webtech project/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Context providers
│   │   ├── pages/         # Page components
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                # Node.js backend
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── server.js         # Entry point
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory:

   ```bash
   copy .env.example .env
   ```

4. Update the `.env` file with your configuration:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/carvista
   JWT_SECRET=your_secret_key_here
   CLIENT_URL=http://localhost:3000
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the client directory (in a new terminal):

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the client directory:

   ```bash
   copy .env.example .env
   ```

4. Start the React app:
   ```bash
   npm start
   ```

The frontend will run on http://localhost:3000

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Cars

- `GET /api/cars` - Get all cars with filters
- `GET /api/cars/:id` - Get single car by ID
- `POST /api/cars` - Add new car (protected)
- `PUT /api/cars/:id` - Update car (protected)
- `DELETE /api/cars/:id` - Delete car (protected)

### Users

- `GET /api/users/profile` - Get user profile (protected)
- `GET /api/users/my-listings` - Get user's listings (protected)
- `PUT /api/users/profile` - Update profile (protected)

## Database Schema

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  listings: [Car IDs],
  createdAt: Date
}
```

### Car Model

```javascript
{
  brand: String,
  model: String,
  year: Number,
  bodyType: String,
  fuelType: String,
  transmission: String,
  exShowroomPrice: Number,
  onRoadPrice: Number,
  mileage: String,
  engineCapacity: String,
  seatingCapacity: Number,
  color: String,
  description: String,
  features: [String],
  owner: User ID,
  ownerName: String,
  ownerEmail: String,
  ownerPhone: String,
  createdAt: Date
}
```

## Development

### Run Backend in Development Mode

```bash
cd server
npm run dev
```

### Run Frontend in Development Mode

```bash
cd client
npm start
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub (see steps below)
2. In Vercel, "Add New Project" and import this repo
3. In Project Settings, set Root Directory to `client`
4. Environment Variables:
   - `REACT_APP_API_URL` = your backend URL (e.g. https://your-backend.onrender.com)
5. Build Command: `npm run build` (default)
6. Output Directory: `client/build` (detected automatically)
7. Deploy

### Backend (Render/Railway recommended)

Vercel’s serverless filesystem is read-only, which doesn’t fit persistent uploads. Use Render or Railway for the Express API:

1. Push your code to GitHub
2. Create a new Web Service from the `server` folder
3. Set environment variables:
   - `PORT` = 5000 (or provided by platform)
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = your secret
   - `CLIENT_URL` = your Vercel frontend URL (e.g. https://your-frontend.vercel.app)
4. Start Command: `npm run start`
5. Deploy and copy the service URL (use it for `REACT_APP_API_URL`)

Optionally, if you want to route `/api/*` through the Vercel domain, edit `vercel.json` at repo root to rewrite `/api/*` to your backend URL.

### Push to GitHub

```bash
# From repo root
git add .
git commit -m "chore: initial import and Vercel config"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Authors

- Your Name

## Acknowledgments

- React.js community
- Tailwind CSS
- MongoDB
- Express.js
