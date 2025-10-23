require('dotenv').config();
const axios = require('axios');

(async () => {
  try {
    console.log('🚀 Calling server for script...');
    const response = await axios.post('http://localhost:3000/api/v1/generate-script', {});
    console.log('✅ Response from server:', response.data);
  } catch (err) {
    console.error('❌ Error hitting server:', err.message);
  }
})();
