const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Car = require('./models/Car');

// Indian cities for dealership locations
const indianCities = [
  { name: 'Bengaluru', state: 'Karnataka', coords: { lat: 12.9716, lng: 77.5946 } },
  { name: 'Mumbai', state: 'Maharashtra', coords: { lat: 19.0760, lng: 72.8777 } },
  { name: 'Delhi', state: 'Delhi', coords: { lat: 28.7041, lng: 77.1025 } },
  { name: 'Hyderabad', state: 'Telangana', coords: { lat: 17.3850, lng: 78.4867 } },
  { name: 'Chennai', state: 'Tamil Nadu', coords: { lat: 13.0827, lng: 80.2707 } },
  { name: 'Pune', state: 'Maharashtra', coords: { lat: 18.5204, lng: 73.8567 } },
  { name: 'Kolkata', state: 'West Bengal', coords: { lat: 22.5726, lng: 88.3639 } },
  { name: 'Ahmedabad', state: 'Gujarat', coords: { lat: 23.0225, lng: 72.5714 } }
];

// Body type mapping
const bodyTypeMap = {
  'Innova': 'SUV', 'Fortuner': 'SUV', 'Glanza': 'Hatchback', 'Camry': 'Sedan',
  'EV6': 'SUV', 'Sonet': 'SUV', 'Seltos': 'SUV', 'Carnival': 'Van',
  'Dzire': 'Sedan', 'Swift': 'Hatchback', 'Ertiga': 'SUV', 'Baleno': 'Hatchback',
  'Amaze': 'Sedan', 'City': 'Sedan', 'Civic': 'Sedan', 'Jazz': 'Hatchback',
  'Verna': 'Sedan', 'i20': 'Hatchback', 'Creta': 'SUV', 'Venue': 'SUV',
  'Scorpio': 'SUV', 'XUV700': 'SUV', 'Thar': 'SUV', 'Bolero': 'SUV',
  'Nexon': 'SUV', 'Harrier': 'SUV', 'Safari': 'SUV', 'Punch': 'SUV', 'Tiago': 'Hatchback', 'Altroz': 'Hatchback',
  'Kiger': 'SUV', 'Kwid': 'Hatchback', 'Duster': 'SUV', 'Lodgy': 'Van',
  'Kushaq': 'SUV', 'Slavia': 'Sedan', 'Superb': 'Sedan',
  'Polo': 'Hatchback', 'Vento': 'Sedan', 'Taigun': 'SUV', 'Tiguan': 'SUV', 'Virtus': 'Sedan'
};

// Generate random dealership data
function generateDealerships(brand, cityCount = 3) {
  const dealerships = [];
  const selectedCities = indianCities.sort(() => 0.5 - Math.random()).slice(0, cityCount);
  
  selectedCities.forEach((city, index) => {
    dealerships.push({
      name: `${brand} ${city.name} Showroom`,
      address: `${Math.floor(Math.random() * 500) + 1}, MG Road, ${city.name}`,
      city: city.name,
      state: city.state,
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: `${brand.toLowerCase().replace(/\s/g, '')}.${city.name.toLowerCase()}@dealer.com`,
      rating: (4 + Math.random()).toFixed(1),
      coordinates: {
        lat: city.coords.lat + (Math.random() - 0.5) * 0.1,
        lng: city.coords.lng + (Math.random() - 0.5) * 0.1
      }
    });
  });
  
  return dealerships;
}

// Generate offers/discounts
function generateOffers() {
  const offers = [];
  const offerTypes = [
    { title: 'Festive Discount', desc: 'Special festive season offer', discount: 50000, percentage: 0 },
    { title: 'Exchange Bonus', desc: 'Extra value on your old car', discount: 30000, percentage: 0 },
    { title: 'Corporate Discount', desc: 'For corporate customers', discount: 0, percentage: 5 },
    { title: 'Cash Discount', desc: 'Pay full amount in cash', discount: 25000, percentage: 0 }
  ];
  
  // Randomly add 1-3 offers
  const numOffers = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < numOffers; i++) {
    const offer = offerTypes[Math.floor(Math.random() * offerTypes.length)];
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + Math.floor(Math.random() * 3) + 1);
    
    offers.push({
      ...offer,
      discountAmount: offer.discount,
      discountPercentage: offer.percentage,
      validUntil,
      termsAndConditions: 'Terms and conditions apply. Visit showroom for details.'
    });
  }
  
  return offers;
}

// Generate car features based on price range
function generateFeatures(price) {
  const basicFeatures = ['Power Steering', 'Power Windows', 'Air Conditioning', 'ABS', 'Airbags'];
  const midFeatures = ['Alloy Wheels', 'Touchscreen Infotainment', 'Rear Parking Sensors', 'Keyless Entry'];
  const premiumFeatures = ['Sunroof', 'Leather Seats', '360° Camera', 'Cruise Control', 'Wireless Charging', 'ADAS'];
  
  let features = [...basicFeatures];
  
  if (price > 1000000) {
    features.push(...midFeatures);
  }
  if (price > 2000000) {
    features.push(...premiumFeatures);
  }
  
  return features;
}

// Generate description
function generateDescription(brand, model, year, fuelType) {
  return `The ${year} ${brand} ${model} is a remarkable vehicle offering excellent ${fuelType} efficiency and modern features. Perfect for Indian road conditions with spacious interiors and advanced safety features.`;
}

const importFullDataset = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carvista');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Car.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin/demo user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'CarVista Admin',
      email: 'admin@carvista.com',
      password: hashedPassword,
      phone: '+91 9999999999'
    });
    console.log('👤 Created admin user: admin@carvista.com (password: password123)');

    // Read and import CSV
    const cars = [];
    const csvFilePath = './indian_cars.csv';

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Parse CSV row
          const brand = row.Brand || row.brand;
          const model = row.Model || row.model;
          const year = parseInt(row.Year || row.year);
          const fuelType = row.Fuel_Type || row.fuelType || row.Fuel;
          const transmission = row.Transmission || row.transmission;
          const price = parseFloat(row.Price || row.price);
          const mileage = row.Mileage || row.mileage;
          const engineCC = row.Engine_CC || row.engineCC || row.Engine;
          const seating = parseInt(row.Seating_Capacity || row.seatingCapacity || row.Seats || 5);
          const serviceCost = parseFloat(row.Service_Cost || row.serviceCost || 0);

          // Determine body type
          const bodyType = bodyTypeMap[model] || 'Sedan';

          // Calculate on-road price (approx 20% markup for registration, insurance, etc.)
          const onRoadPrice = Math.round(price * 1.2);

          // Build car object
          const carData = {
            brand,
            model,
            year,
            bodyType,
            fuelType,
            transmission,
            exShowroomPrice: price,
            onRoadPrice,
            mileage: mileage ? `${mileage} km/l` : '15 km/l',
            engineCapacity: engineCC ? `${engineCC}cc` : '1500cc',
            seatingCapacity: seating,
            color: ['White', 'Black', 'Silver', 'Red', 'Blue'][Math.floor(Math.random() * 5)],
            description: generateDescription(brand, model, year, fuelType),
            features: generateFeatures(price),
            images: [],
            dealerships: generateDealerships(brand, 3),
            offers: generateOffers(),
            serviceCost: serviceCost || Math.round(price * 0.01),
            warrantyYears: Math.random() > 0.5 ? 3 : 2,
            listingType: 'new',
            owner: user._id,
            ownerName: user.name,
            ownerEmail: user.email,
            ownerPhone: user.phone,
            isVerified: true
          };

          cars.push(carData);
        } catch (error) {
          console.error('Error parsing row:', error.message);
        }
      })
      .on('end', async () => {
        try {
          console.log(`📊 Parsed ${cars.length} cars from CSV`);
          
          // Insert in batches to avoid memory issues
          const batchSize = 500;
          let inserted = 0;
          
          for (let i = 0; i < cars.length; i += batchSize) {
            const batch = cars.slice(i, i + batchSize);
            await Car.insertMany(batch);
            inserted += batch.length;
            console.log(`✅ Inserted ${inserted}/${cars.length} cars...`);
          }

          // Update user's listings
          const allCars = await Car.find({ owner: user._id });
          user.listings = allCars.map(car => car._id);
          await user.save();

          console.log('\n✅ Database import completed successfully!');
          console.log(`🚗 Total cars imported: ${cars.length}`);
          console.log('\nYou can now login with:');
          console.log('Email: admin@carvista.com');
          console.log('Password: password123');

          process.exit(0);
        } catch (error) {
          console.error('❌ Error inserting cars:', error);
          process.exit(1);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        process.exit(1);
      });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

importFullDataset();
