# Importing Kaggle Dataset Instructions

## 📥 How to Import the Indian Car Market Dataset

### Step 1: Download the Dataset

1. Go to: https://www.kaggle.com/datasets/ak0212/indian-car-market-dataset
2. Download the CSV file (you may need to create a free Kaggle account)
3. The file will likely be named something like `indian_cars.csv` or similar

### Step 2: Place the CSV File

1. Rename the downloaded CSV file to: **`indian_cars.csv`**
2. Place it in the **`server`** folder (same folder as this README)
   ```
   webtech project/
   └── server/
       ├── indian_cars.csv  ← Put the CSV file here
       ├── importKaggle.js
       ├── server.js
       └── ...
   ```

### Step 3: Run the Import Script

**Make sure MongoDB is running**, then run:

```cmd
cd server
npm run import
```

This will:

- ✅ Clear existing data
- ✅ Create a demo user account
- ✅ Import cars from the Kaggle CSV
- ✅ Map the data to match our database schema

### What if CSV is Not Found?

If you haven't downloaded the CSV yet, the script will automatically add 3 sample cars so you can still test the application.

### Demo Login Credentials

After import, you can login with:

- **Email:** demo@carvista.com
- **Password:** password123

## 🔧 CSV Format Expected

The import script automatically handles common column names from the Kaggle dataset:

- Make/make → Brand
- Model/model → Model
- Year/year → Year
- Price/Ex-Showroom_Price → Price
- Fuel Type/Fuel → Fuel Type
- Transmission → Transmission
- Mileage → Mileage
- Engine Displacement/Engine → Engine Capacity
- Seating Capacity/Seats → Seating

## ⚙️ Customization

You can edit `importKaggle.js` to:

- Change the number of cars imported (default: 50)
- Modify price calculations
- Adjust feature mappings
- Customize data transformations

## 🚀 After Import

1. Start the backend: `npm run dev`
2. Start the frontend: `cd ../client && npm start`
3. Visit: http://localhost:3000
4. Browse the imported cars!
