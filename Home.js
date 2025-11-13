import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, IndianRupee } from 'lucide-react';

const Home = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    bodyType: '',
    fuelType: '',
    transmission: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (filters.bodyType) params.append('bodyType', filters.bodyType);
        if (filters.fuelType) params.append('fuelType', filters.fuelType);
        if (filters.transmission) params.append('transmission', filters.transmission);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

        const response = await axios.get(`/api/cars?${params.toString()}`);
        setCars(response.data.cars);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cars:', error);
        setLoading(false);
      }
    };

    fetchCars();
  }, [search, filters]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      bodyType: '',
      fuelType: '',
      transmission: '',
      minPrice: '',
      maxPrice: ''
    });
    setSearch('');
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
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Discover Your Dream Car
        </h1>
        <p className="text-gray-600 text-lg">
          Explore new car models with on-road prices in Bengaluru
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by brand or model..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-gray-600" />
          <h2 className="text-xl font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.bodyType}
            onChange={(e) => handleFilterChange('bodyType', e.target.value)}
          >
            <option value="">Body Type</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            <option value="SUV">SUV</option>
            <option value="Coupe">Coupe</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.fuelType}
            onChange={(e) => handleFilterChange('fuelType', e.target.value)}
          >
            <option value="">Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.transmission}
            onChange={(e) => handleFilterChange('transmission', e.target.value)}
          >
            <option value="">Transmission</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
            <option value="CVT">CVT</option>
          </select>

          <input
            type="number"
            placeholder="Min Price"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          />

          <input
            type="number"
            placeholder="Max Price"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          />
        </div>
        <button
          onClick={clearFilters}
          className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
        >
          Clear Filters
        </button>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No cars found matching your criteria</p>
          </div>
        ) : (
          cars.map((car) => (
            <Link
              key={car._id}
              to={`/car/${car._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img 
                  src={car.images && car.images[0] ? car.images[0] : '/images/cars/placeholder.svg'} 
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {e.target.src = '/images/cars/placeholder.svg'}}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {car.brand} {car.model}
                </h3>
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p>{car.year} • {car.bodyType} • {car.fuelType}</p>
                  <p>{car.transmission}</p>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">On-Road Price</p>
                      <p className="text-lg font-bold text-primary-600 flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        {car.onRoadPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Ex-Showroom</p>
                      <p className="text-sm font-semibold text-gray-700 flex items-center justify-end">
                        <IndianRupee className="w-3 h-3" />
                        {car.exShowroomPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
