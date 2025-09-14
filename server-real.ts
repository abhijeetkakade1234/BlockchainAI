// Real NFT Agent API Server - TypeScript version
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { askGemini } from './nft-agent/gemini.js';
import { runAction } from './nft-agent/actions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Real NFT Agent API Server is running' });
});

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

    // Use the real Gemini AI to decide what action to take
    const decision = await askGemini(query);
    console.log(`🧠 Gemini decision:`, decision);

    if (decision.type === "action") {
      console.log(`⚡ Running action: ${decision.action}...`);
      
      try {
        const result = await runAction(decision.action, decision.params || {});
        console.log(`✅ Action result:`, result);

        res.json({
          type: 'action',
          action: decision.action,
          params: decision.params,
          result: result,
          success: true
        });
      } catch (actionError: any) {
        console.error(`❌ Action error:`, actionError);
        res.json({
          type: 'action',
          action: decision.action,
          params: decision.params,
          result: null,
          success: false,
          error: actionError.message || 'Action failed'
        });
      }
    } else {
      console.log(`💬 Chat response: ${decision.message}`);
      res.json({
        type: 'chat',
        message: decision.message,
        success: true
      });
    }
  } catch (error: any) {
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
  console.log(`🚀 Real NFT Agent API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🔧 Using REAL NFT Agent functionality`);
});

export default app;
