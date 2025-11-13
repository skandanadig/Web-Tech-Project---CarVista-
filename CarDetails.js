import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, IndianRupee, Phone, Mail, Fuel, Gauge, Users, Calendar } from 'lucide-react';

const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await axios.get(`/api/cars/${id}`);
        setCar(response.data.car);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching car details:', error);
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Car not found</p>
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">
          Go back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Image gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          <div className="lg:col-span-2">
            <div className="h-96 bg-gray-100 overflow-hidden rounded-lg">
              <img
                src={car.images && car.images[0] ? car.images[0] : '/images/cars/placeholder.svg'}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/images/cars/placeholder.svg' }}
              />
            </div>

            {/* thumbnails */}
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {(car.images && car.images.length ? car.images : ['/images/cars/placeholder.svg']).map((img, idx) => (
                <button key={idx} onClick={() => {
                  // swap primary image
                  const imgs = [...(car.images || [])];
                  if (imgs.length > 0) {
                    const selected = imgs[idx];
                    imgs[0] = selected;
                    imgs[idx] = car.images[0];
                    setCar({ ...car, images: imgs });
                  }
                }} className="w-24 h-16 rounded overflow-hidden border">
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" onError={(e)=>{e.target.src='/images/cars/placeholder.svg'}} />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 p-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              {/* Car Title & quick actions */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  {car.brand} {car.model}
                </h1>
                <p className="text-gray-600">{car.year} • {car.bodyType} • {car.fuelType}</p>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 text-sm">On-Road Price</p>
                <p className="text-2xl font-bold text-primary-600 flex items-center">
                  <IndianRupee className="w-6 h-6" /> {car.onRoadPrice.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="space-y-2">
                <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">Contact Dealer</button>
                <button className="w-full border border-primary-600 text-primary-600 py-2 rounded-lg">Book Test Drive</button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Car Title */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {car.brand} {car.model}
            </h1>
            <p className="text-gray-600 text-lg">{car.year} Model</p>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="text-gray-600 mb-2">Ex-Showroom Price (Bengaluru)</p>
              <p className="text-3xl font-bold text-gray-800 flex items-center">
                <IndianRupee className="w-8 h-8" />
                {car.exShowroomPrice.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">On-Road Price (Bengaluru)</p>
              <p className="text-3xl font-bold text-primary-600 flex items-center">
                <IndianRupee className="w-8 h-8" />
                {car.onRoadPrice.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Specifications */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-primary-600">
                  <Fuel className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fuel Type</p>
                  <p className="font-semibold">{car.fuelType}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-primary-600">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transmission</p>
                  <p className="font-semibold">{car.transmission}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-primary-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Seating</p>
                  <p className="font-semibold">{car.seatingCapacity} Seater</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-primary-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Body Type</p>
                  <p className="font-semibold">{car.bodyType}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {car.mileage && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Mileage</p>
                  <p className="font-semibold text-lg">{car.mileage}</p>
                </div>
              )}
              {car.engineCapacity && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Engine Capacity</p>
                  <p className="font-semibold text-lg">{car.engineCapacity}</p>
                </div>
              )}
              {car.color && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Color</p>
                  <p className="font-semibold text-lg">{car.color}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{car.description}</p>
            </div>
          )}

          {/* Features */}
          {car.features && car.features.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {car.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-primary-600">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seller Contact */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Seller</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg font-semibold text-gray-800 mb-4">{car.ownerName}</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <a href={`mailto:${car.ownerEmail}`} className="hover:text-primary-600">
                    {car.ownerEmail}
                  </a>
                </div>
                {car.ownerPhone && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <a href={`tel:${car.ownerPhone}`} className="hover:text-primary-600">
                      {car.ownerPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Available Offers */}
          {car.offers && car.offers.length > 0 && (
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🎉 Special Offers & Discounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {car.offers.map((offer, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{offer.title}</h3>
                    <p className="text-gray-600 mb-3">{offer.description}</p>
                    {offer.discountAmount > 0 && (
                      <p className="text-2xl font-bold text-green-600 mb-2">
                        Save ₹{offer.discountAmount.toLocaleString('en-IN')}
                      </p>
                    )}
                    {offer.discountPercentage > 0 && (
                      <p className="text-2xl font-bold text-green-600 mb-2">
                        {offer.discountPercentage}% OFF
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Valid until: {new Date(offer.validUntil).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{offer.termsAndConditions}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authorized Dealerships */}
          {car.dealerships && car.dealerships.length > 0 && (
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🏢 Authorized Dealerships</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {car.dealerships.map((dealer, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{dealer.name}</h3>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">
                        ⭐ {dealer.rating}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-start">
                        <span className="font-semibold mr-2">📍</span>
                        <span>{dealer.address}, {dealer.city}, {dealer.state}</span>
                      </p>
                      <p className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        <a href={`tel:${dealer.phone}`} className="hover:text-primary-600">
                          {dealer.phone}
                        </a>
                      </p>
                      <p className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        <a href={`mailto:${dealer.email}`} className="hover:text-primary-600 break-all">
                          {dealer.email}
                        </a>
                      </p>
                    </div>
                    <button className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 text-sm font-semibold">
                      Get Directions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
