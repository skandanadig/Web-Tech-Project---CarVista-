const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Car = require('./models/Car');

// Function to get image URL for a car
function getCarImageUrl(brand, model) {
  // Clean the brand and model names for file matching
  const cleanBrand = brand.toLowerCase().replace(/\s+/g, '-');
  const cleanModel = model.toLowerCase().replace(/\s+/g, '-');
  
  // Possible image filenames
  const possibleNames = [
    `${cleanBrand}-${cleanModel}.jpg`,
    `${cleanBrand}-${cleanModel}.png`,
    `${cleanBrand}_${cleanModel}.jpg`,
    `${cleanBrand}_${cleanModel}.png`,
    `${cleanModel}.jpg`,
    `${cleanModel}.png`
  ];
  
  return possibleNames;
}

// Function to match car images from a folder
function matchCarImages(imagesFolder) {
  const imageMap = {};
  
  if (!fs.existsSync(imagesFolder)) {
    console.log('⚠️  Images folder not found:', imagesFolder);
    return imageMap;
  }
  
  const files = fs.readdirSync(imagesFolder);
  console.log(`📁 Found ${files.length} files in images folder`);
  
  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      const basename = path.basename(file, ext).toLowerCase();
      imageMap[basename] = file;
    }
  });
  
  return imageMap;
}

// Function to find best matching image for a car
function findBestImage(brand, model, imageMap) {
  const cleanBrand = brand.toLowerCase().replace(/\s+/g, '-');
  const cleanModel = model.toLowerCase().replace(/\s+/g, '-');
  
  // Try different naming patterns
  const searchPatterns = [
    `${cleanBrand}-${cleanModel}`,
    `${cleanBrand}_${cleanModel}`,
    `${cleanBrand}${cleanModel}`,
    cleanModel,
    `${cleanBrand} ${cleanModel}`.replace(/\s+/g, '-'),
    `${cleanBrand} ${cleanModel}`.replace(/\s+/g, '_')
  ];
  
  for (const pattern of searchPatterns) {
    if (imageMap[pattern]) {
      return imageMap[pattern];
    }
    
    // Partial match
    for (const key of Object.keys(imageMap)) {
      if (key.includes(pattern) || pattern.includes(key)) {
        return imageMap[key];
      }
    }
  }
  
  return null;
}

const addImagesToDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carvista');
    console.log('✅ Connected to MongoDB');

    // Path to images folder
    const imagesFolder = path.join(__dirname, '../client/public/images/cars');
    
    console.log('📂 Checking for images in:', imagesFolder);
    
    // Get all image files
    const imageMap = matchCarImages(imagesFolder);
    const imageCount = Object.keys(imageMap).length;
    
    if (imageCount === 0) {
      console.log('\n⚠️  No images found!');
      console.log('📝 Please add car images to: client/public/images/cars/');
      console.log('\n💡 Image naming suggestions:');
      console.log('   - maruti-swift.jpg');
      console.log('   - hyundai-creta.jpg');
      console.log('   - tata-nexon.jpg');
      console.log('   OR');
      console.log('   - swift.jpg');
      console.log('   - creta.jpg');
      console.log('   - nexon.jpg');
      
      // Add placeholder image to all cars
      console.log('\n📸 Setting placeholder images for all cars...');
      await Car.updateMany({}, {
        $set: { images: ['/images/cars/placeholder.jpg'] }
      });
      console.log('✅ Added placeholder images to all cars');
      
    } else {
      console.log(`✅ Found ${imageCount} car images`);
      
      // Get all cars from database
      const cars = await Car.find({});
      console.log(`🚗 Processing ${cars.length} cars...`);
      
      let matchedCount = 0;
      let unmatchedCount = 0;
      
      for (const car of cars) {
        const imageName = findBestImage(car.brand, car.model, imageMap);
        
        if (imageName) {
          const imageUrl = `/images/cars/${imageName}`;
          await Car.findByIdAndUpdate(car._id, {
            $set: { images: [imageUrl] }
          });
          console.log(`✅ ${car.brand} ${car.model} → ${imageName}`);
          matchedCount++;
        } else {
          // Use placeholder
          await Car.findByIdAndUpdate(car._id, {
            $set: { images: ['/images/cars/placeholder.jpg'] }
          });
          console.log(`⚠️  ${car.brand} ${car.model} → No image found, using placeholder`);
          unmatchedCount++;
        }
      }
      
      console.log(`\n📊 Results:`);
      console.log(`   ✅ Matched: ${matchedCount} cars`);
      console.log(`   ⚠️  Unmatched: ${unmatchedCount} cars (using placeholder)`);
    }
    
    console.log('\n✅ Image update complete!');
    console.log('🚀 Restart your servers to see the changes');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating images:', error);
    process.exit(1);
  }
};

addImagesToDatabase();
