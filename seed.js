const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Car = require('./models/Car');

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
    features: ['Keyless Entry', 'Push Button Start', 'Touchscreen Infotainment', 'Rear Parking Sensors']
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
    features: ['Panoramic Sunroof', 'Ventilated Seats', '360 Camera', 'Wireless Charging', 'ADAS Level 2']
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
    features: ['Fast Charging', 'Connected Car Tech', 'Air Purifier', 'Regenerative Braking', 'Dual Airbags']
  },
  {
    brand: 'Honda',
    model: 'City',
    year: 2024,
    bodyType: 'Sedan',
    fuelType: 'Petrol',
    transmission: 'CVT',
    exShowroomPrice: 1150000,
    onRoadPrice: 1330000,
    mileage: '18.4 km/l',
    engineCapacity: '1498cc',
    seatingCapacity: 5,
    color: 'Radiant Red Metallic',
    description: 'Honda City is a premium sedan known for its refined performance and comfortable interiors.',
    features: ['Cruise Control', 'Lane Watch Camera', 'Sunroof', 'Auto Climate Control', 'Honda Connect']
  },
  {
    brand: 'Mahindra',
    model: 'Thar',
    year: 2024,
    bodyType: 'SUV',
    fuelType: 'Diesel',
    transmission: 'Manual',
    exShowroomPrice: 1099000,
    onRoadPrice: 1280000,
    mileage: '15 km/l',
    engineCapacity: '2184cc',
    seatingCapacity: 4,
    color: 'Rocky Beige',
    description: 'The Mahindra Thar is an iconic off-roader with modern features and powerful performance.',
    features: ['4x4 System', 'Convertible Roof', 'Terrain Modes', 'Touchscreen with Navigation', 'Hill Hold']
  },
  {
    brand: 'Kia',
    model: 'Seltos',
    year: 2024,
    bodyType: 'SUV',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    exShowroomPrice: 1350000,
    onRoadPrice: 1550000,
    mileage: '16.5 km/l',
    engineCapacity: '1497cc',
    seatingCapacity: 5,
    color: 'Glacier White Pearl',
    description: 'Kia Seltos offers premium features and a bold design at a competitive price point.',
    features: ['LED Headlamps', 'Bose Sound System', 'Ventilated Seats', 'Smart Pure Air', 'Drive Modes']
  }
];

const seedDatabase = async () => {
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
    console.log('👤 Created sample user: demo@carvista.com (password: password123)');

    // Add cars with the sample user as owner
    const cars = await Promise.all(
      sampleCars.map(car => 
        Car.create({
          ...car,
          owner: user._id,
          ownerName: user.name,
          ownerEmail: user.email,
          ownerPhone: user.phone
        })
      )
    );

    // Update user's listings
    user.listings = cars.map(car => car._id);
    await user.save();

    console.log(`🚗 Added ${cars.length} sample cars`);
    console.log('\n✅ Database seeded successfully!');
    console.log('\nYou can now login with:');
    console.log('Email: demo@carvista.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
