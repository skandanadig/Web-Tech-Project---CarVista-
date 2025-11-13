import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle } from 'lucide-react';

const AddCar = () => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    bodyType: 'Sedan',
    fuelType: 'Petrol',
    transmission: 'Manual',
    exShowroomPrice: '',
    onRoadPrice: '',
    mileage: '',
    engineCapacity: '',
    seatingCapacity: 5,
    color: '',
    description: '',
    features: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let imagesPaths = [];
      if (selectedImages.length > 0) {
        const uploadForm = new FormData();
        selectedImages.forEach(f => uploadForm.append('images', f));
        const uploadRes = await axios.post('/api/uploads/car-image', uploadForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imagesPaths = uploadRes.data.images || [];
      }

      const carData = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        images: imagesPaths
      };

      await axios.post('/api/cars', carData);
      navigate('/profile');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add car. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <PlusCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Add Car Listing</h2>
          <p className="text-gray-600 mt-2">Share your car details with potential buyers</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Brand *</label>
              <input
                type="text"
                name="brand"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Toyota"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Model *</label>
              <input
                type="text"
                name="model"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Camry"
                value={formData.model}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Year *</label>
              <input
                type="number"
                name="year"
                required
                min="2000"
                max={new Date().getFullYear() + 1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.year}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Body Type *</label>
              <select
                name="bodyType"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.bodyType}
                onChange={handleChange}
              >
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="SUV">SUV</option>
                <option value="Coupe">Coupe</option>
                <option value="Convertible">Convertible</option>
                <option value="Wagon">Wagon</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Fuel Type *</label>
              <select
                name="fuelType"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.fuelType}
                onChange={handleChange}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Transmission *</label>
              <select
                name="transmission"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.transmission}
                onChange={handleChange}
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="CVT">CVT</option>
                <option value="DCT">DCT</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Ex-Showroom Price (₹) *</label>
              <input
                type="number"
                name="exShowroomPrice"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 1500000"
                value={formData.exShowroomPrice}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">On-Road Price (₹) *</label>
              <input
                type="number"
                name="onRoadPrice"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 1700000"
                value={formData.onRoadPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Mileage</label>
              <input
                type="text"
                name="mileage"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 15 km/l"
                value={formData.mileage}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Engine Capacity</label>
              <input
                type="text"
                name="engineCapacity"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 1500cc"
                value={formData.engineCapacity}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Seating Capacity</label>
              <input
                type="number"
                name="seatingCapacity"
                min="2"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.seatingCapacity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Color</label>
            <input
              type="text"
              name="color"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Pearl White"
              value={formData.color}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              name="description"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe your car..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Features (comma-separated)</label>
            <input
              type="text"
              name="features"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Sunroof, Leather Seats, Parking Sensors"
              value={formData.features}
              onChange={handleChange}
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full"
            />
            {selectedImages.length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {selectedImages.map((file, idx) => (
                  <div key={idx} className="w-24 h-16 rounded overflow-hidden border">
                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding Car...' : 'Add Car Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCar;
