#!/bin/bash

echo "🤖 Auto-Buy NFT Demo - Complete Workflow"
echo "========================================"

USER_ID="testuser"

echo ""
echo "1️⃣ Creating auto-buy alert: 'buy Cool Cats when it drops below 0.3 ETH'"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "buy Cool Cats when it drops below 0.3 ETH"}' | jq '.message'

echo ""
echo "2️⃣ Checking current wallet balance..."
curl -s http://localhost:3001/api/wallet/$USER_ID | jq '.wallet.balance'

echo ""
echo "3️⃣ Emulating price drop to 0.25 ETH (should trigger auto-buy)..."
curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\", \"collectionName\": \"Cool Cats\", \"newPrice\": 0.25, \"currency\": \"ETH\"}" | jq '.details'

echo ""
echo "4️⃣ Checking updated wallet balance and NFT holdings..."
FINAL_WALLET=$(curl -s http://localhost:3001/api/wallet/$USER_ID)
echo "Balance:"
echo $FINAL_WALLET | jq '.wallet.balance'
echo ""
echo "NFT Holdings:"
echo $FINAL_WALLET | jq '.wallet.nftHoldings | length'
echo $FINAL_WALLET | jq '.wallet.nftHoldings[-1] | {name, collection, purchasePrice, purchaseCurrency}'

echo ""
echo "5️⃣ Testing another auto-buy with different collection..."
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "auto buy BAYC below 10 ETH"}' | jq '.message'

echo ""
echo "6️⃣ Emulating BAYC price drop to 9 ETH..."
curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\", \"collectionName\": \"BAYC\", \"newPrice\": 9, \"currency\": \"ETH\"}" | jq '.details'

echo ""
echo "7️⃣ Final wallet state..."
FINAL_WALLET2=$(curl -s http://localhost:3001/api/wallet/$USER_ID)
echo "Balance:"
echo $FINAL_WALLET2 | jq '.wallet.balance'
echo ""
echo "Total NFT Holdings:"
echo $FINAL_WALLET2 | jq '.wallet.nftHoldings | length'

echo ""
echo "✅ Auto-Buy Demo Complete!"
echo ""
echo "📝 Supported Auto-Buy Commands:"
echo "   • 'buy Cool Cats when it drops below 0.3 ETH'"
echo "   • 'auto buy BAYC below 10 ETH'"
echo "   • 'set auto buy for Bored Ape at 8 ETH'"
echo "   • 'buy NFT if price drops below 5 ETH'"
echo "   • 'alert me to buy Cool Cats when below 0.2 ETH'"
