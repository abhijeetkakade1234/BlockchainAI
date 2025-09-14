// Test file to verify environment variables
console.log('Environment Variables Test:');
console.log('Firebase API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('AgentKit API Key:', import.meta.env.VITE_AGENTKIT_API_KEY ? '✅ Set' : '❌ Missing');
console.log('Gemini API Key:', import.meta.env.VITE_GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('Private Key:', import.meta.env.VITE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
console.log('RPC URL:', import.meta.env.VITE_RPC_URL);
console.log('Chain ID:', import.meta.env.VITE_CHAIN_ID);
