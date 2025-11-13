import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Star, ChevronDown, ChevronUp } from 'lucide-react';

const DealersView = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDealer, setExpandedDealer] = useState(null);
  const [expandedModel, setExpandedModel] = useState({});

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const response = await axios.get('/api/dealers');
        setDealers(response.data.dealers || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dealers:', error);
        setLoading(false);
      }
    };

    fetchDealers();
  }, []);

  const toggleDealer = (index) => {
    setExpandedDealer(expandedDealer === index ? null : index);
  };

  const toggleModel = (dealerIndex, modelIndex) => {
    const key = `${dealerIndex}-${modelIndex}`;
    setExpandedModel(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (dealers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 text-lg">No dealers found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Authorized Dealers</h1>
        <p className="text-gray-600">Browse by dealer, then explore models and variants</p>
      </div>

      <div className="space-y-4">
        {dealers.map((dealer, dealerIdx) => (
          <div key={dealerIdx} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Dealer Header */}
            <button
              onClick={() => toggleDealer(dealerIdx)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">{dealer.name}</h2>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    {dealer.rating || 4.5}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {dealer.city}, {dealer.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {dealer.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {dealer.email}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{dealer.address}</p>
              </div>
              <div className="ml-4">
                {expandedDealer === dealerIdx ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </button>

            {/* Models List (expanded) */}
            {expandedDealer === dealerIdx && (
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Available Models ({dealer.models.length})
                </h3>
                <div className="space-y-3">
                  {dealer.models.map((modelGroup, modelIdx) => (
                    <div key={modelIdx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {/* Model Header */}
                      <button
                        onClick={() => toggleModel(dealerIdx, modelIdx)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-primary-600 font-bold text-lg">
                              {modelGroup.modelName.charAt(0)}
                            </span>
                          </div>
                          <div className="text-left">
                            <h4 className="text-lg font-semibold text-gray-800">
                              {modelGroup.modelName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {modelGroup.variants.length} variant{modelGroup.variants.length !== 1 ? 's' : ''} available
                            </p>
                          </div>
                        </div>
                        {expandedModel[`${dealerIdx}-${modelIdx}`] ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>

                      {/* Variants List (expanded) */}
                      {expandedModel[`${dealerIdx}-${modelIdx}`] && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {modelGroup.variants.map((variant) => (
                              <Link
                                key={variant.id}
                                to={`/car/${variant.id}`}
                                className="block bg-white rounded-lg border border-gray-200 hover:shadow-lg hover:border-primary-500 transition-all p-4"
                              >
                                <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                                  <img
                                    src={variant.images[0] || '/images/cars/placeholder.svg'}
                                    alt={variant.fullModel}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = '/images/cars/placeholder.svg'; }}
                                  />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-800 mb-1">
                                    {variant.brand} {variant.fullModel}
                                  </h5>
                                  {variant.variant && (
                                    <p className="text-sm text-gray-600 mb-2">
                                      {variant.variant}
                                    </p>
                                  )}
                                  <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 text-sm font-semibold">
                                    View Details
                                  </button>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealersView;
