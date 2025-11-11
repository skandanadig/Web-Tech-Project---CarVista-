const mongoose = require('mongoose');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const path = require('path');
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
  { name: 'Ahmedabad', state: 'Gujarat', coords: { lat: 23.0225, lng: 72.5714 } },
  { name: 'Jaipur', state: 'Rajasthan', coords: { lat: 26.9124, lng: 75.7873 } },
  { name: 'Lucknow', state: 'Uttar Pradesh', coords: { lat: 26.8467, lng: 80.9462 } }
];

// Generate random dealership data
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

// Generate offers/discounts
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

// Generate car features based on price range
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
  
  return [...new Set(features)]; // Remove duplicates
}

// Generate description
function generateDescription(brand, model, year, fuelType, bodyType) {
  const descriptions = [
    `The ${year} ${brand} ${model} is a stunning ${bodyType} that combines performance with efficiency. With its ${fuelType} engine, it offers exceptional mileage and driving dynamics perfect for Indian roads.`,
    `Experience the perfect blend of style and substance with the ${brand} ${model}. This ${year} ${bodyType} features cutting-edge technology and superior comfort, making every journey memorable.`,
    `Introducing the ${brand} ${model} ${year} - a ${bodyType} that redefines excellence. Powered by an efficient ${fuelType} engine and packed with premium features for the modern Indian family.`,
    `The ${brand} ${model} stands out as a premium ${bodyType} offering superior build quality, advanced safety features, and remarkable ${fuelType} efficiency. Perfect for both city and highway driving.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

const importExcelDataset = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carvista');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Car.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'CarVista Admin',
      email: 'admin@carvista.com',
      password: hashedPassword,
      phone: '+91 9876543210'
    });
    console.log('👤 Created admin user: admin@carvista.com (password: password123)');

    // Read Excel file
    const excelFilePath = path.join(__dirname, '..', '.vscode', 'Cars dataset.xlsx');
    console.log(`📂 Reading Excel file: ${excelFilePath}`);
    
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${jsonData.length} rows in Excel`);

    const cars = [];
    let skipped = 0;

    // The first row contains headers, skip it
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Process each brand section in the row
        const brandSections = [
          { brand: 'Maruti Suzuki', prefix: 'Maruti Suzuki(ARENA) ', startCol: 0 },
          { brand: 'Maruti Suzuki', prefix: 'Maruti Suzuki (NEXA)', startCol: 8 }
        ];

        for (const section of brandSections) {
          const keys = Object.keys(row);
          const sectionKey = keys.find(k => k.includes(section.prefix));
          
          if (!sectionKey || !row[sectionKey]) continue;

          const model = row[sectionKey]?.toString().trim();
          const version = row[keys[section.startCol + 1]]?.toString().trim();
          const year = parseInt(row[keys[section.startCol + 2]] || 2025);
          const exShowroomLakhs = parseFloat(row[keys[section.startCol + 3]] || 0);
          const onRoadLakhs = parseFloat(row[keys[section.startCol + 4]] || 0);
          const bodyType = row[keys[section.startCol + 5]]?.toString().trim() || 'Sedan';
          const fuelType = row[keys[section.startCol + 6]]?.toString().trim() || 'Petrol';
          const transmission = row[keys[section.startCol + 7]]?.toString().trim() || 'Manual';

          // Convert lakhs to rupees
          const exShowroomPrice = Math.round(exShowroomLakhs * 100000);
          const onRoadPrice = Math.round(onRoadLakhs * 100000);

          // Skip if essential data is missing
          if (!model || exShowroomPrice === 0 || model.toLowerCase().includes('model')) {
            continue;
          }

          const fullModel = version ? `${model} ${version}` : model;

          // Build car object
          const carData = {
            brand: section.brand,
            model: fullModel,
            year,
            bodyType,
            fuelType,
            transmission,
            exShowroomPrice,
            onRoadPrice: onRoadPrice || Math.round(exShowroomPrice * 1.18),
            mileage: `${(15 + Math.random() * 10).toFixed(1)} km/l`,
            engineCapacity: bodyType === 'SUV' ? '1500cc' : '1200cc',
            seatingCapacity: bodyType === 'SUV' ? 7 : 5,
            color: ['White', 'Black', 'Silver', 'Red', 'Blue'][Math.floor(Math.random() * 5)],
            description: generateDescription(section.brand, fullModel, year, fuelType, bodyType),
            features: generateFeatures(exShowroomPrice, section.brand),
            images: [],
            dealerships: generateDealerships(section.brand, 3),
            offers: generateOffers(),
            serviceCost: Math.round(exShowroomPrice * 0.01),
            warrantyYears: exShowroomPrice > 2000000 ? 3 : 2,
            listingType: 'new',
            owner: user._id,
            ownerName: user.name,
            ownerEmail: user.email,
            ownerPhone: user.phone,
            isVerified: true
          };

          cars.push(carData);
        }
      } catch (error) {
        console.error(`⚠️  Error parsing row ${i}: ${error.message}`);
        skipped++;
      }
    }

    console.log(`✅ Parsed ${cars.length} cars (skipped ${skipped} invalid rows)`);

    if (cars.length === 0) {
      console.log('❌ No valid cars to import!');
      process.exit(1);
    }

    // Insert in batches
    console.log('📥 Inserting cars into database...');
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

    console.log('\n🎉 Database import completed successfully!');
    console.log(`🚗 Total cars imported: ${cars.length}`);
    console.log(`🏢 Dealerships per car: 3`);
    console.log(`💰 Offers per car: 1-3`);
    console.log('\n📝 Login credentials:');
    console.log('Email: admin@carvista.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

importExcelDataset();
