const XLSX = require('xlsx');
const path = require('path');

const filePath = '/Users/robdillisse/Desktop/Sentry Hackathon/Catawiki - FE_Mobile_Be Error&Performance monitoring.xlsx';

try {
  const workbook = XLSX.readFile(filePath);

  console.log('Sheet Names:', workbook.SheetNames);
  console.log('\n===================\n');

  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n--- Sheet ${index + 1}: ${sheetName} ---\n`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    // Print first 20 rows
    data.slice(0, 20).forEach((row, i) => {
      console.log(`Row ${i}:`, JSON.stringify(row));
    });

    console.log(`\n... Total rows: ${data.length}\n`);
  });
} catch (error) {
  console.error('Error reading Excel file:', error.message);
}
