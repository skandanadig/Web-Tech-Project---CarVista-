import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import CarDetails from './pages/CarDetails';
import DealersView from './pages/DealersView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AddCar from './pages/AddCar';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes> 
            <Route path="/" element={<Home />} />
            <Route path="/dealers" element={<DealersView />} />
            <Route path="/car/:id" element={<CarDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/add-car"
              element={
                <PrivateRoute>
                  <AddCar />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
          </Routes>
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
