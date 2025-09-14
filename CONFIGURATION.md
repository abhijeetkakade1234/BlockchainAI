# NFT Price Alert System - Configuration Guide

## Overview
The NFT Price Alert System is now fully configurable with no hardcoded values. All settings can be customized via environment variables.

## Environment Variables

### Required Configuration

#### NFT Agent Configuration
- `GEMINI_API_KEY`: Your Google Gemini API key for AI decision making
- `PRIVATE_KEY`: Your wallet private key for blockchain interactions
- `API_KEY`: Your API key for blockchain operations
- `RPC_URL`: RPC endpoint URL for blockchain connectivity
- `MORALIS_API_KEY`: Moralis API key for NFT data

#### Blockchain Configuration
- `CHAIN_ID`: Blockchain chain ID (default: 43114 for Avalanche)
- `CHAIN_NAME`: Blockchain name for API calls (default: "avalanche")
- `MORALIS_BASE_URL`: Moralis API base URL (default: "https://deep-index.moralis.io/api/v2.2")

### Optional Configuration

#### Server Configuration
- `PORT`: Server port (default: 3001)
- `API_BASE_URL`: Base URL for API endpoints (default: "http://localhost:3001")
- `DEFAULT_USER_ID`: Default user ID for testing (default: "testuser")

#### Bun Configuration
- `BUN_PATH`: Path to bun executable (default: "/Users/egoist/.bun/bin/bun")

#### Frontend Configuration
- `REACT_APP_API_BASE_URL`: API base URL for React app (default: "http://localhost:3001/api")
- `REACT_APP_DEFAULT_USER_ID`: Default user ID for React app (default: "testuser")

## Setup Instructions

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your actual values:
   ```bash
   nano .env
   ```

3. Install dependencies:
   ```bash
   npm install
   cd nft-agent && npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Multi-Chain Support

The system supports multiple blockchains by configuring:

- `CHAIN_ID`: Set to your target blockchain's chain ID
- `CHAIN_NAME`: Set to your target blockchain's name (e.g., "ethereum", "polygon", "bsc")

### Supported Chains
- Avalanche (43114) - Default
- Ethereum (1)
- Polygon (137)
- BSC (56)
- Any Moralis-supported chain

## Production Deployment

For production deployment:

1. Set `API_BASE_URL` to your production domain
2. Set `REACT_APP_API_BASE_URL` to your production API URL
3. Use production-grade API keys and RPC endpoints
4. Configure proper user authentication instead of using `DEFAULT_USER_ID`

## Security Notes

- Never commit `.env` files to version control
- Use environment-specific API keys
- Implement proper user authentication in production
- Use HTTPS in production environments

## Troubleshooting

### Common Issues

1. **Bun Path Issues**: Update `BUN_PATH` to your system's bun installation path
2. **API Connection Issues**: Verify `API_BASE_URL` and `RPC_URL` are correct
3. **Chain Configuration**: Ensure `CHAIN_ID` and `CHAIN_NAME` match your target blockchain

### Testing Configuration

Test your configuration by running:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "notify me when cool cats falls below 0.5 ETH"}'
```

This should create a price alert and return a success response.
