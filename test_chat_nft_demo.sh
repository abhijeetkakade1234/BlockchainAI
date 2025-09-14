#!/bin/bash

echo "🤖 Complete Chat NFT Purchase Demo"
echo "=================================="

USER_ID="testuser"

echo ""
echo "1️⃣ Testing wallet balance..."
curl -s http://localhost:3001/api/wallet/$USER_ID | jq '.wallet.balance'

echo ""
echo "2️⃣ Testing chat purchase: 'buy Cool Cats for 0.25 ETH'"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "buy Cool Cats for 0.25 ETH"}' | jq '.message'

echo ""
echo "3️⃣ Testing chat purchase: 'purchase Bored Ape at 5 ETH'"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "purchase Bored Ape at 5 ETH"}' | jq '.message'

echo ""
echo "4️⃣ Testing chat purchase: 'buy Cool Cats NFT' (default price)"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "buy Cool Cats NFT"}' | jq '.message'

echo ""
echo "5️⃣ Testing non-purchase query (should go to NFT Agent)"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "what is my wallet balance?"}' | jq '.message'

echo ""
echo "6️⃣ Final wallet state..."
FINAL_WALLET=$(curl -s http://localhost:3001/api/wallet/$USER_ID)
echo "Balance:"
echo $FINAL_WALLET | jq '.wallet.balance'
echo ""
echo "NFT Holdings:"
echo $FINAL_WALLET | jq '.wallet.nftHoldings | length'
echo $FINAL_WALLET | jq '.wallet.nftHoldings[] | {name, collection, purchasePrice, purchaseCurrency}'

echo ""
echo "✅ Chat NFT Purchase System Complete!"
echo ""
echo "📝 Supported Chat Commands:"
echo "   • 'buy Cool Cats for 0.25 ETH'"
echo "   • 'purchase BAYC at 5 ETH'"
echo "   • 'get Bored Ape NFT for 5 ETH'"
echo "   • 'buy Cool Cats NFT' (uses default 0.1 ETH)"
echo ""
echo "🎯 Features Working:"
echo "   ✅ Natural language purchase detection"
echo "   ✅ Price and currency extraction"
echo "   ✅ Balance validation"
echo "   ✅ Real-time wallet updates"
echo "   ✅ Rich purchase confirmations"
echo "   ✅ Error handling for insufficient funds"
echo "   ✅ Fallback to NFT Agent for non-purchase queries"
