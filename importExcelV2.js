const mongoose = require('mongoose');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Car = require('./models/Car');

// Import helper functions
const {
  generateDealerships,
  generateOffers,
  generateFeatures,
  generateDescription
} = require('./importHelpers');

const importCarsFromExcel = async () => {
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

    const excelFilePath = path.join(__dirname, '..', '.vscode', 'Cars dataset.xlsx');
    console.log(`📂 Reading: ${excelFilePath}`);
    
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get raw data with header row
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`📊 Found ${rawData.length} rows`);

    const cars = [];
    const brandRow = rawData[0]; // Row 0: Brand names
    const headerRow = rawData[1]; // Row 1: Column headers
    
    // Identify brand columns (row 0)
    const brandColumns = [];
    for (let i = 0; i < brandRow.length; i++) {
      const cellValue = brandRow[i];
      if (cellValue && typeof cellValue === 'string' && cellValue.trim()) {
        const brandName = cellValue.trim().replace(/\s*\(.*?\)\s*/g, '').trim();
        brandColumns.push({ brand: brandName, startCol: i });
      }
    }

    console.log(`🏢 Found ${brandColumns.length} brand sections:`, brandColumns.map(b => `${b.brand} at col ${b.startCol}`));

    // Process data rows (skip rows 0 and 1 which are headers)
    for (let rowIdx = 2; rowIdx < rawData.length; rowIdx++) {
      const row = rawData[rowIdx];
      
      for (const brandInfo of brandColumns) {
        try {
          const colIdx = brandInfo.startCol;
          
          // Extract data from this brand's columns (8 columns per brand)
          const model = row[colIdx]?.toString().trim();
          const version = row[colIdx + 1]?.toString().trim();
          const year = parseInt(row[colIdx + 2]) || 2025;
          const exShowroomLakhs = parseFloat(row[colIdx + 3]) || 0;
          const onRoadLakhs = parseFloat(row[colIdx + 4]) || 0;
          const bodyType = row[colIdx + 5]?.toString().trim() || 'Sedan';
          const fuelType = row[colIdx + 6]?.toString().trim() || 'Petrol';
          const transmission = row[colIdx + 7]?.toString().trim() || 'Manual';

          // Debug first few rows
          if (rowIdx < 5) {
            console.log(`Row ${rowIdx} ${brandInfo.brand}:`, {
              model, version, year, exShowroomLakhs, onRoadLakhs, bodyType, fuelType, transmission
            });
          }

          // Skip invalid rows
          if (!model || exShowroomLakhs === 0) {
            continue;
          }

          // Convert lakhs to rupees
          const exShowroomPrice = Math.round(exShowroomLakhs * 100000);
          const onRoadPrice = onRoadLakhs ? Math.round(onRoadLakhs * 100000) : Math.round(exShowroomPrice * 1.18);

          const fullModel = version ? `${model} ${version}`.trim() : model;

          const carData = {
            brand: brandInfo.brand,
            model: fullModel,
            year,
            bodyType,
            fuelType,
            transmission,
            exShowroomPrice,
            onRoadPrice,
            mileage: `${(15 + Math.random() * 10).toFixed(1)} km/l`,
            engineCapacity: bodyType.toLowerCase().includes('suv') ? '1500cc' : '1200cc',
            seatingCapacity: bodyType.toLowerCase().includes('suv') ? 7 : 5,
            color: ['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey'][Math.floor(Math.random() * 6)],
            description: generateDescription(brandInfo.brand, fullModel, year, fuelType, bodyType),
            features: generateFeatures(exShowroomPrice, brandInfo.brand),
            images: [],
            dealerships: generateDealerships(brandInfo.brand, 3),
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
          // Skip silently
        }
      }
    }

    console.log(`✅ Parsed ${cars.length} valid cars`);

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

    console.log('\n🎉 Import complete!');
    console.log(`🚗 Total cars: ${cars.length}`);
    console.log(`🏢 Dealers per car: 3`);
    console.log(`💰 Offers per car: 1-3`);
    console.log('\n📝 Login: admin@carvista.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

importCarsFromExcel();
