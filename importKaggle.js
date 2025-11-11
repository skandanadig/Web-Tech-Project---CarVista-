const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Car = require('./models/Car');

// Function to parse CSV file
function parseCSV(filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  const lines = data.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const obj = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    result.push(obj);
  }
  
  return result;
}

// Function to map Kaggle data to our Car model
function mapKaggleDataToCar(kaggleData, owner) {
  const cars = [];
  
  kaggleData.forEach((row, index) => {
    try {
      // Extract and clean data from Kaggle dataset
      const brand = row.Make || row.make || 'Unknown';
      const model = row.Model || row.model || 'Unknown';
      const year = parseInt(row.Year || row.year || new Date().getFullYear());
      
      // Determine body type
      let bodyType = 'Sedan';
      const modelLower = model.toLowerCase();
      if (modelLower.includes('suv') || row.Type?.toLowerCase().includes('suv')) bodyType = 'SUV';
      else if (modelLower.includes('hatchback') || row.Type?.toLowerCase().includes('hatch')) bodyType = 'Hatchback';
      else if (modelLower.includes('sedan')) bodyType = 'Sedan';
      
      // Determine fuel type
      let fuelType = 'Petrol';
      const fuelData = (row['Fuel Type'] || row.Fuel || row.fuel || '').toLowerCase();
      if (fuelData.includes('diesel')) fuelType = 'Diesel';
      else if (fuelData.includes('electric') || fuelData.includes('ev')) fuelType = 'Electric';
      else if (fuelData.includes('hybrid')) fuelType = 'Hybrid';
      else if (fuelData.includes('cng')) fuelType = 'CNG';
      
      // Determine transmission
      let transmission = 'Manual';
      const transData = (row.Transmission || row.transmission || '').toLowerCase();
      if (transData.includes('automatic') || transData.includes('amt')) transmission = 'Automatic';
      else if (transData.includes('cvt')) transmission = 'CVT';
      else if (transData.includes('dct')) transmission = 'DCT';
      
      // Extract prices (handle various formats)
      let exShowroomPrice = 0;
      let onRoadPrice = 0;
      
      // Try different price column names
      const priceData = row.Price || row['Ex-Showroom_Price'] || row.price || row['Ex Showroom Price'] || '0';
      const priceStr = priceData.toString().replace(/[₹,\s]/g, '');
      
      if (priceStr.includes('Lakh')) {
        exShowroomPrice = parseFloat(priceStr) * 100000;
      } else if (priceStr.includes('Crore')) {
        exShowroomPrice = parseFloat(priceStr) * 10000000;
      } else {
        exShowroomPrice = parseFloat(priceStr) || Math.floor(Math.random() * 2000000) + 500000;
      }
      
      // Calculate on-road price (approximately 15-20% more than ex-showroom)
      onRoadPrice = Math.floor(exShowroomPrice * 1.17);
      
      // Extract other details
      const mileage = row.Mileage || row.mileage || `${Math.floor(Math.random() * 10) + 12} km/l`;
      const engineCapacity = row['Engine Displacement'] || row.Engine || row.engine || `${Math.floor(Math.random() * 1000) + 1000}cc`;
      const seatingCapacity = parseInt(row['Seating Capacity'] || row.Seats || row.seats || 5);
      const color = row.Color || row.color || row.Colour || 'Not specified';
      
      // Features array
      const features = [];
      if (row.Features) {
        features.push(...row.Features.split(',').map(f => f.trim()));
      } else {
        // Add some default features
        features.push('Air Conditioning', 'Power Steering', 'Power Windows', 'ABS', 'Airbags');
      }
      
      const car = {
        brand,
        model,
        year,
        bodyType,
        fuelType,
        transmission,
        exShowroomPrice,
        onRoadPrice,
        mileage,
        engineCapacity,
        seatingCapacity,
        color,
        description: `${brand} ${model} ${year} - A reliable and feature-rich vehicle with excellent performance and comfort.`,
        features,
        owner: owner._id,
        ownerName: owner.name,
        ownerEmail: owner.email,
        ownerPhone: owner.phone || ''
      };
      
      cars.push(car);
    } catch (error) {
      console.log(`Skipping row ${index + 1} due to error:`, error.message);
    }
  });
  
  return cars;
}

const importKaggleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carvista');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Car.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create a sample user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@carvista.com',
      password: hashedPassword,
      phone: '+91 9876543210'
    });
    console.log('👤 Created demo user: demo@carvista.com (password: password123)');

    // Look for CSV file in the server directory
    const csvPath = path.join(__dirname, 'indian_cars.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('\n⚠️  CSV file not found at:', csvPath);
      console.log('📝 Please download the CSV from Kaggle and save it as "indian_cars.csv" in the server folder');
      console.log('\nFor now, adding some sample cars...\n');
      
      // Add sample cars if CSV not found
      const sampleCars = [
        {
          brand: 'Maruti Suzuki',
          model: 'Swift',
          year: 2024,
          bodyType: 'Hatchback',
          fuelType: 'Petrol',
          transmission: 'Manual',
          exShowroomPrice: 599000,
          onRoadPrice: 720000,
          mileage: '23 km/l',
          engineCapacity: '1197cc',
          seatingCapacity: 5,
          color: 'Pearl Arctic White',
          description: 'The Maruti Suzuki Swift is a stylish and fuel-efficient hatchback perfect for city driving.',
          features: ['Keyless Entry', 'Push Button Start', 'Touchscreen Infotainment', 'Rear Parking Sensors'],
          owner: user._id,
          ownerName: user.name,
          ownerEmail: user.email,
          ownerPhone: user.phone
        },
        {
          brand: 'Hyundai',
          model: 'Creta',
          year: 2024,
          bodyType: 'SUV',
          fuelType: 'Diesel',
          transmission: 'Automatic',
          exShowroomPrice: 1450000,
          onRoadPrice: 1680000,
          mileage: '18 km/l',
          engineCapacity: '1493cc',
          seatingCapacity: 5,
          color: 'Phantom Black',
          description: 'Hyundai Creta combines bold design with advanced features, making it one of the most popular SUVs.',
          features: ['Panoramic Sunroof', 'Ventilated Seats', '360 Camera', 'Wireless Charging', 'ADAS Level 2'],
          owner: user._id,
          ownerName: user.name,
          ownerEmail: user.email,
          ownerPhone: user.phone
        },
        {
          brand: 'Tata',
          model: 'Nexon EV',
          year: 2024,
          bodyType: 'SUV',
          fuelType: 'Electric',
          transmission: 'Automatic',
          exShowroomPrice: 1499000,
          onRoadPrice: 1550000,
          mileage: '465 km range',
          engineCapacity: 'Electric Motor',
          seatingCapacity: 5,
          color: 'Intensi-Teal',
          description: 'Tata Nexon EV is India\'s best-selling electric SUV with impressive range and performance.',
          features: ['Fast Charging', 'Connected Car Tech', 'Air Purifier', 'Regenerative Braking'],
          owner: user._id,
          ownerName: user.name,
          ownerEmail: user.email,
          ownerPhone: user.phone
        }
      ];
      
      const cars = await Car.insertMany(sampleCars);
      user.listings = cars.map(car => car._id);
      await user.save();
      
      console.log(`✅ Added ${cars.length} sample cars`);
    } else {
      // Parse and import CSV data
      console.log('📂 Reading CSV file...');
      const kaggleData = parseCSV(csvPath);
      console.log(`📊 Found ${kaggleData.length} rows in CSV`);
      
      // Map Kaggle data to our Car model
      const carsData = mapKaggleDataToCar(kaggleData, user);
      
      // Limit to first 50 cars for initial import (you can change this)
      const carsToImport = carsData.slice(0, 50);
      
      console.log(`📝 Importing ${carsToImport.length} cars to database...`);
      const cars = await Car.insertMany(carsToImport);
      
      // Update user's listings
      user.listings = cars.map(car => car._id);
      await user.save();
      
      console.log(`✅ Successfully imported ${cars.length} cars from Kaggle dataset!`);
    }

    console.log('\n✅ Database populated successfully!');
    console.log('\n🎉 You can now login with:');
    console.log('   Email: demo@carvista.com');
    console.log('   Password: password123');
    console.log('\n🚀 Start the servers and visit http://localhost:3000');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
};

importKaggleData();
