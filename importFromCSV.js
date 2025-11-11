const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Car = require('./models/Car');
const {
  generateDealerships,
  generateOffers,
  generateFeatures,
  generateDescription
} = require('./importHelpers');

const importCarsFromCSV = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carvista');
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Car.deleteMany({});
    console.log('✅ Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'CarVista Admin',
      email: 'admin@carvista.com',
      password: hashedPassword,
      phone: '+91 9876543210'
    });
    console.log('👤 Created admin user: admin@carvista.com (password: password123)');

    const csvFilePath = path.join(__dirname, '..', '.vscode', 'Cars dataset.xlsx.csv');
    console.log(`📂 Reading CSV: ${csvFilePath}`);

    const cars = [];
    let currentBrand = '';
    let currentModel = '';
    let rowCount = 0;

    fs.createReadStream(csvFilePath)
      .pipe(csv({ headers: false, skipLines: 0 }))
      .on('data', (row) => {
        try {
          rowCount++;
          const values = Object.values(row);
          
          // Check if this is a brand header row (first column has text, rest empty or mostly empty)
          const firstCol = values[0]?.toString().trim();
          const hasContent = values.slice(1, 7).some(v => v && v.toString().trim());
          
          if (firstCol && !hasContent && !firstCol.toLowerCase().includes('model')) {
            // This is a brand name row
            currentBrand = firstCol.replace(/\s*\(.*?\)\s*/g, '').trim();
            console.log(`📍 Found brand: ${currentBrand}`);
            return;
          }

          // Skip header rows and empty rows
          if (!firstCol || 
              firstCol.toLowerCase().includes('model') || 
              firstCol.toLowerCase().includes('version') ||
              values.every(v => !v || !v.toString().trim())) {
            return;
          }

          // This is a data row
          if (!currentBrand) return;

          // Parse the row data
          const model = values[0]?.toString().trim();
          const version = values[1]?.toString().trim();
          const year = parseInt(values[2]) || 2025;
          const exShowroomLakhs = parseFloat(values[3]) || 0;
          const onRoadLakhs = parseFloat(values[4]) || 0;
          const bodyType = values[5]?.toString().trim() || 'Sedan';
          const fuelType = values[6]?.toString().trim() || 'Petrol';
          const transmission = values[7]?.toString().trim() || 'Manual';

          // If model is empty, use the current model (continuation row)
          if (model) {
            currentModel = model;
          }

          // Skip if no price
          if (exShowroomLakhs === 0) return;

          // Convert lakhs to rupees
          const exShowroomPrice = Math.round(exShowroomLakhs * 100000);
          const onRoadPrice = onRoadLakhs ? Math.round(onRoadLakhs * 100000) : Math.round(exShowroomPrice * 1.18);

          const fullModel = version ? `${currentModel} ${version}`.trim() : currentModel;

          const carData = {
            brand: currentBrand,
            model: fullModel,
            year,
            bodyType: bodyType.trim(),
            fuelType: fuelType.trim(),
            transmission: transmission.trim(),
            exShowroomPrice,
            onRoadPrice,
            mileage: `${(15 + Math.random() * 10).toFixed(1)} km/l`,
            engineCapacity: bodyType.toLowerCase().includes('suv') ? '1500cc' : '1200cc',
            seatingCapacity: bodyType.toLowerCase().includes('suv') || bodyType.toLowerCase().includes('mpv') ? 7 : 5,
            color: ['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey'][Math.floor(Math.random() * 6)],
            description: generateDescription(currentBrand, fullModel, year, fuelType, bodyType),
            features: generateFeatures(exShowroomPrice, currentBrand),
            images: [],
            dealerships: generateDealerships(currentBrand, 3),
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
        } catch (error) {
          console.error(`⚠️  Error on row ${rowCount}:`, error.message);
        }
      })
      .on('end', async () => {
        try {
          console.log(`\n✅ Parsed ${cars.length} valid cars from ${rowCount} rows`);

          if (cars.length === 0) {
            console.log('❌ No valid cars found!');
            process.exit(1);
          }

          console.log('📥 Inserting into database...');
          const batchSize = 500;
          let inserted = 0;

          for (let i = 0; i < cars.length; i += batchSize) {
            const batch = cars.slice(i, i + batchSize);
            await Car.insertMany(batch);
            inserted += batch.length;
            console.log(`✅ Inserted ${inserted}/${cars.length} cars...`);
          }

          const allCars = await Car.find({ owner: user._id });
          user.listings = allCars.map(car => car._id);
          await user.save();

          // Print summary
          const brands = [...new Set(cars.map(c => c.brand))];
          console.log('\n🎉 Import complete!');
          console.log(`🚗 Total cars: ${cars.length}`);
          console.log(`🏢 Brands: ${brands.length} (${brands.join(', ')})`);
          console.log(`🏬 Dealers per car: 3`);
          console.log(`💰 Offers per car: 1-3`);
          console.log('\n📝 Login credentials:');
          console.log('Email: admin@carvista.com');
          console.log('Password: password123');

          process.exit(0);
        } catch (error) {
          console.error('❌ Error inserting data:', error.message);
          console.error(error.stack);
          process.exit(1);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error.message);
        process.exit(1);
      });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

importCarsFromCSV();
