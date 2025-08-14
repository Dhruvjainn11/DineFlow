// healthCheck.js - Simple health check
import axios from 'axios';

const checkHealth = async () => {
  try {
    console.log('🔍 Checking server health...');
    const response = await axios.get('http://localhost:5000');
    console.log('✅ Server is running!');
    console.log('📝 Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Server is not responding:', error.message);
    return false;
  }
};

checkHealth().catch(console.error);
