# NFT Agent Integration Setup

This project integrates the NFT Agent functionality with a React chat interface.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Required for NFT Agent functionality
PRIVATE_KEY=your_private_key_here
API_KEY=your_api_key_here
RPC_URL=your_rpc_url_here
MORALIS_API_KEY=your_moralis_api_key_here

# Required for Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Server configuration
PORT=3001
```

### 3. Start the Development Environment

To run both the React frontend and the NFT Agent server:

```bash
npm run dev:full
```

Or run them separately:

```bash
# Terminal 1: Start the NFT Agent server
npm run server

# Terminal 2: Start the React frontend
npm run dev
```

### 4. Usage

1. Open your browser to `http://localhost:5173` (React frontend)
2. The NFT Agent server will be running on `http://localhost:3001`
3. Use the chat interface to interact with the NFT Agent

### Available Commands

- **Check Balance**: "What is my wallet balance?"
- **Get Address**: "What is my wallet address?"
- **NFT Floor Price**: "Get floor price for Bored Ape Yacht Club"
- **My NFTs**: "Show me my NFTs"
- **Transfer**: "Send 0.1 ETH to 0x..."

### Features

- Real-time chat with NFT Agent
- Quick action buttons for common tasks
- Error handling and user feedback
- Responsive design with dark/light mode
- Integration with Avalanche blockchain

### Troubleshooting

If you encounter connection errors:
1. Make sure the NFT Agent server is running on port 3001
2. Check that all environment variables are properly set
3. Verify your API keys are valid and have the necessary permissions
