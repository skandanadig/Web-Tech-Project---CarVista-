const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();

const Car = require('./models/Car');

/**
 * Parse carsimages.csv:
 * - First section: brand, model, image link
 * - Second section: brand logo links
 * 
 * Attaches image URLs to matching car documents.
 */

const importCarImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carvista');
    console.log('✅ Connected to MongoDB');

    const csvFilePath = path.join(__dirname, '..', '.vscode', 'carsimages.csv');
    console.log(`📂 Reading images CSV: ${csvFilePath}`);

    const imageMapping = {}; // { brand: { model: imageLink }}
    let parsingBrands = true;

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv({ headers: false }))
        .on('data', (row) => {
          const values = Object.values(row);
          const col0 = (values[0] || '').toString().trim();
          const col1 = (values[1] || '').toString().trim();
          const col2 = (values[2] || '').toString().trim();

          // Skip header/empty rows
          if (!col0 || col0.toLowerCase().includes('car model') || col0.toLowerCase().includes('brand')) {
            if (col0.toLowerCase().includes('car brands')) {
              parsingBrands = false; // switch to logo section
            }
            return;
          }

          if (parsingBrands) {
            // Parse car model images section
            // Format: Brand, Model, Image Link
            // Example: "Maruti Suzuki", "Fronx", "Maruti Suzuki Fronx Image Gallery (Dealer)"
            const brand = col0;
            const model = col1;
            const imageLink = col2;

            if (brand && model && imageLink) {
              if (!imageMapping[brand]) {
                imageMapping[brand] = {};
              }
              // Store image link (could be URL or text reference)
              imageMapping[brand][model] = imageLink;
            }
          }
          // We could parse brand logos from second section if needed
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`\n📊 Parsed image data for ${Object.keys(imageMapping).length} brands`);

    // Now match cars in DB and update their images field
    let updated = 0;
    let notFound = 0;

    for (const brand of Object.keys(imageMapping)) {
      const models = imageMapping[brand];
      
      for (const modelName of Object.keys(models)) {
        const imageLink = models[modelName];

        // Find cars that match this brand and model (fuzzy match on model)
        const cars = await Car.find({
          brand: { $regex: new RegExp(brand, 'i') },
          model: { $regex: new RegExp(modelName, 'i') }
        });

        if (cars.length === 0) {
          notFound++;
          console.log(`⚠️  No cars found for ${brand} ${modelName}`);
          continue;
        }

        // For simplicity, we'll store the text link as a placeholder
        // In production, you'd download images or use actual URLs
        const imagePlaceholder = `/images/cars/${brand.replace(/\s+/g, '_')}_${modelName.replace(/\s+/g, '_')}.jpg`;

        for (const car of cars) {
          // Add placeholder image if no images exist
          if (!car.images || car.images.length === 0) {
            car.images = [imagePlaceholder];
            await car.save();
            updated++;
          }
        }

        console.log(`✅ Updated ${cars.length} cars for ${brand} ${modelName}`);
      }
    }

    console.log(`\n🎉 Image import complete!`);
    console.log(`✅ Updated: ${updated} cars`);
    console.log(`⚠️  Not found: ${notFound} brand-model combinations`);
    console.log(`\n💡 Note: Images are currently placeholders. To use actual images:`);
    console.log(`   1. Place car images in server/public/images/cars/`);
    console.log(`   2. Name them: BrandName_ModelName.jpg`);
    console.log(`   3. Or update the imageLink parsing to use actual URLs from CSV`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

importCarImages();
