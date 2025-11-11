// Shared helper functions for car data import

const indianCities = [
  { name: 'Bengaluru', state: 'Karnataka', coords: { lat: 12.9716, lng: 77.5946 } },
  { name: 'Mumbai', state: 'Maharashtra', coords: { lat: 19.0760, lng: 72.8777 } },
  { name: 'Delhi', state: 'Delhi', coords: { lat: 28.7041, lng: 77.1025 } },
  { name: 'Hyderabad', state: 'Telangana', coords: { lat: 17.3850, lng: 78.4867 } },
  { name: 'Chennai', state: 'Tamil Nadu', coords: { lat: 13.0827, lng: 80.2707 } },
  { name: 'Pune', state: 'Maharashtra', coords: { lat: 18.5204, lng: 73.8567 } },
  { name: 'Kolkata', state: 'West Bengal', coords: { lat: 22.5726, lng: 88.3639 } },
  { name: 'Ahmedabad', state: 'Gujarat', coords: { lat: 23.0225, lng: 72.5714 } },
  { name: 'Jaipur', state: 'Rajasthan', coords: { lat: 26.9124, lng: 75.7873 } },
  { name: 'Lucknow', state: 'Uttar Pradesh', coords: { lat: 26.8467, lng: 80.9462 } }
];

function generateDealerships(brand, cityCount = 3) {
  const dealerships = [];
  const selectedCities = indianCities.sort(() => 0.5 - Math.random()).slice(0, cityCount);
  
  selectedCities.forEach((city) => {
    dealerships.push({
      name: `${brand} ${city.name} Authorized Dealer`,
      address: `${Math.floor(Math.random() * 500) + 1}, Main Road, ${city.name}`,
      city: city.name,
      state: city.state,
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: `${brand.toLowerCase().replace(/\s/g, '')}.${city.name.toLowerCase()}@dealer.com`,
      rating: Number((4 + Math.random()).toFixed(1)),
      coordinates: {
        lat: city.coords.lat + (Math.random() - 0.5) * 0.1,
        lng: city.coords.lng + (Math.random() - 0.5) * 0.1
      }
    });
  });
  
  return dealerships;
}

function generateOffers() {
  const offers = [];
  const offerTypes = [
    { title: 'Festive Season Offer', desc: 'Special festive discount', discount: 50000, percentage: 0 },
    { title: 'Exchange Bonus', desc: 'Additional value on your old car exchange', discount: 30000, percentage: 0 },
    { title: 'Corporate Discount', desc: 'Exclusive discount for corporate customers', discount: 0, percentage: 5 },
    { title: 'Cash Discount', desc: 'Pay full amount upfront', discount: 25000, percentage: 0 },
    { title: 'Year-End Clearance', desc: 'Limited period offer', discount: 0, percentage: 8 }
  ];
  
  const numOffers = Math.floor(Math.random() * 3) + 1;
  const selectedOffers = [];
  
  for (let i = 0; i < numOffers; i++) {
    const offer = offerTypes[Math.floor(Math.random() * offerTypes.length)];
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + Math.floor(Math.random() * 6) + 1);
    
    selectedOffers.push({
      title: offer.title,
      description: offer.desc,
      discountAmount: offer.discount,
      discountPercentage: offer.percentage,
      validUntil,
      termsAndConditions: 'Terms and conditions apply. Visit authorized showroom for complete details.'
    });
  }
  
  return selectedOffers;
}

function generateFeatures(price, brand) {
  const basicFeatures = ['Power Steering', 'Power Windows', 'Central Locking', 'Air Conditioning', 'ABS with EBD', 'Dual Airbags'];
  const midFeatures = ['Alloy Wheels', 'Touchscreen Infotainment', 'Rear Parking Sensors', 'Keyless Entry', 'Push Button Start', 'Automatic Climate Control'];
  const premiumFeatures = ['Sunroof/Moonroof', 'Leather Seats', '360° Camera', 'Cruise Control', 'Wireless Charging', 'Digital Instrument Cluster', 'Ventilated Seats'];
  const luxuryFeatures = ['ADAS Level 2', 'Panoramic Sunroof', 'Powered Tailgate', 'Ambient Lighting', 'Multi-zone Climate Control', 'Premium Sound System'];
  
  let features = [...basicFeatures];
  
  if (price > 800000) {
    features.push(...midFeatures.slice(0, Math.floor(Math.random() * 3) + 2));
  }
  if (price > 1500000) {
    features.push(...premiumFeatures.slice(0, Math.floor(Math.random() * 4) + 2));
  }
  if (price > 2500000) {
    features.push(...luxuryFeatures.slice(0, Math.floor(Math.random() * 3) + 2));
  }
  
  return [...new Set(features)];
}

function generateDescription(brand, model, year, fuelType, bodyType) {
  const descriptions = [
    `The ${year} ${brand} ${model} is a stunning ${bodyType} that combines performance with efficiency. With its ${fuelType} engine, it offers exceptional mileage and driving dynamics perfect for Indian roads.`,
    `Experience the perfect blend of style and substance with the ${brand} ${model}. This ${year} ${bodyType} features cutting-edge technology and superior comfort, making every journey memorable.`,
    `Introducing the ${brand} ${model} ${year} - a ${bodyType} that redefines excellence. Powered by an efficient ${fuelType} engine and packed with premium features for the modern Indian family.`,
    `The ${brand} ${model} stands out as a premium ${bodyType} offering superior build quality, advanced safety features, and remarkable ${fuelType} efficiency. Perfect for both city and highway driving.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

module.exports = {
  generateDealerships,
  generateOffers,
  generateFeatures,
  generateDescription
};
