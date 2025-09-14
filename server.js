// Mock NFT Agent Service - Simulates NFT Agent functionality for testing
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'NFT Agent API Server is running' });
});

// Mock NFT Agent responses
const mockResponses = {
  'balance': {
    type: 'action',
    action: 'GetBalanceAction',
    result: { balance: '2.5 ETH' },
    success: true
  },
  'address': {
    type: 'action', 
    action: 'GetAddressAction',
    result: { address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' },
    success: true
  },
  'nfts': {
    type: 'action',
    action: 'get_wallet_nfts',
    result: {
      success: true,
      nfts: [
        { name: 'Cool Cat #1234', collection_name: 'Cool Cats', tokenId: '1234' },
        { name: 'Bored Ape #5678', collection_name: 'Bored Ape Yacht Club', tokenId: '5678' }
      ]
    },
    success: true
  },
  'floor_price': {
    type: 'action',
    action: 'get_nft_floor_price',
    result: {
      success: true,
      floor_price_eth: '15.2',
      floor_price_usd: '38250',
      collection_name: 'Bored Ape Yacht Club',
      marketplace: 'OpenSea',
      total_supply: 10000,
      owners_count: 6500,
      volume_24h: '1250000',
      source: 'real_nft_api'
    },
    success: true
  }
};

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        type: 'chat',
        message: 'Please provide a valid query.',
        error: 'Invalid query format'
      });
    }

    console.log(`🤖 Received query: ${query}`);

    // Simple keyword matching for demo
    const lowerQuery = query.toLowerCase();
    
    let response;
    if (lowerQuery.includes('balance')) {
      response = mockResponses.balance;
    } else if (lowerQuery.includes('address')) {
      response = mockResponses.address;
    } else if (lowerQuery.includes('nft') && lowerQuery.includes('my')) {
      response = mockResponses.nfts;
    } else if (lowerQuery.includes('floor') || lowerQuery.includes('price')) {
      response = mockResponses.floor_price;
    } else {
      response = {
        type: 'chat',
        message: `I understand you're asking about: "${query}". I can help you with wallet balances, NFT floor prices, transfers, and more. Try asking "What is my wallet balance?" or "Get floor price for Bored Ape Yacht Club".`,
        success: true
      };
    }

    console.log(`📤 Sending response:`, response);
    res.json(response);

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      type: 'chat',
      message: 'I apologize, but I encountered an error processing your request.',
      error: error.message || 'Unknown error',
      success: false
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NFT Agent API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🎭 Running in MOCK mode for testing`);
});

module.exports = app;