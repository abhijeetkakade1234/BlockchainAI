# NFT Agent - Production Ready

A professional NFT Agent that provides real-time floor prices and NFT data from the internet.

## 🚀 Features

- **Real Floor Prices**: Get actual NFT floor prices from CoinGecko API
- **Popular Collections**: Support for Bored Apes, CryptoPunks, Azuki, Doodles
- **Wallet Management**: Check balances, addresses, and owned NFTs
- **Avalanche Integration**: Full support for Avalanche C-Chain
- **Professional UI**: Clean, formatted output

## 📦 Core Files

- `nftAgent.ts` - Main application entry point
- `actions.ts` - Core action handlers
- `gemini.ts` - AI decision engine
- `real_nft_api.ts` - Real NFT data integration
- `real_floor_price_tracker.ts` - Avalanche-specific price tracking

## 🔧 Setup

1. Install dependencies:
```bash
bun install
```

2. Configure environment variables in `.env`:
```bash
GEMINI_API_KEY=your_key_here
PRIVATE_KEY=your_key_here
API_KEY=your_key_here
RPC_URL=your_url_here
MORALIS_API_KEY=your_key_here
GOLDRUSH_API_KEY=your_key_here
```

## 🎯 Usage

Start the NFT Agent:
```bash
bun run nftAgent.ts
```

Ask for real floor prices:
```
What's the floor price of boredape?
What's the floor price of cryptopunks?
Show me Bored Ape floor price
```

## 📊 Supported Collections

- **boredape, bayc** → Bored Ape Yacht Club
- **cryptopunks, punks** → CryptoPunks
- **azuki** → Azuki
- **doodles** → Doodles

## 🏗️ Architecture

- **AI Layer**: Gemini AI for natural language processing
- **Action Layer**: Modular action handlers
- **API Layer**: Real-time data from multiple sources
- **Display Layer**: Professional formatted output

## 🔮 Ready for Features

The codebase is structured for easy feature additions:
- New NFT collections
- Additional marketplaces
- Enhanced analytics
- Portfolio management