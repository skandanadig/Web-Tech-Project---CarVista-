import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, Trash2, IndianRupee } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserListings();
  }, []);

  const fetchUserListings = async () => {
    try {
      const response = await axios.get('/api/users/my-listings');
      setListings(response.data.cars);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (carId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await axios.delete(`/api/cars/${carId}`);
        setListings(listings.filter(car => car._id !== carId));
      } catch (error) {
        console.error('Error deleting car:', error);
        alert('Failed to delete listing');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.name}</h1>
            <div className="space-y-1 text-gray-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{user?.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* My Listings */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Listings</h2>
          <Link
            to="/add-car"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium"
          >
            Add New Car
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">You haven't added any car listings yet</p>
            <Link
              to="/add-car"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
            >
              Add Your First Car
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((car) => (
              <div key={car._id} className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="h-40 bg-gray-100 overflow-hidden">
                  <img 
                    src={car.images && car.images[0] ? car.images[0] : '/images/cars/placeholder.svg'} 
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {e.target.src = '/images/cars/placeholder.svg'}}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {car.brand} {car.model}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p>{car.year} • {car.bodyType} • {car.fuelType}</p>
                    <p className="text-lg font-bold text-primary-600 flex items-center">
                      <IndianRupee className="w-4 h-4" />
                      {car.onRoadPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Link
                      to={`/car/${car._id}`}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-center text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(car._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
