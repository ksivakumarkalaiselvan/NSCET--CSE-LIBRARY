const googleSheetsService = require('../services/googleSheetsService');

async function testConnection() {
  console.log('🔗 Testing connection to Google Sheets Web App API...');
  console.log('Script URL:', googleSheetsService.scriptUrl);

  try {
    const pingResult = await googleSheetsService.sendRequest('ping', {});
    console.log('✅ Ping Response:', pingResult);

    const stats = await googleSheetsService.getDashboardStats();
    console.log('✅ Dashboard Stats from Google Sheets:', stats);

    const books = await googleSheetsService.getBooks({});
    console.log(`✅ Books retrieved from Google Sheets: ${books.length} books found.`);

    console.log('\n🎉 GOOGLE SHEETS DATABASE CONNECTION IS LIVE & FULLY FUNCTIONAL!');
  } catch (error) {
    console.error('❌ Google Sheets Connection Test Failed:', error);
    process.exit(1);
  }
}

testConnection();
