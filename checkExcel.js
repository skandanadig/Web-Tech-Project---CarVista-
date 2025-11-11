const XLSX = require('xlsx');
const path = require('path');

const excelFilePath = path.join(__dirname, '..', '.vscode', 'Cars dataset.xlsx');
const workbook = XLSX.readFile(excelFilePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Total rows:', rawData.length);
console.log('\nHeader row (row 0):');
console.log(rawData[0]);
console.log('\nFirst data row (row 1):');
console.log(rawData[1]);
console.log('\nSecond data row (row 2):');
console.log(rawData[2]);
console.log('\nThird data row (row 3):');
console.log(rawData[3]);
