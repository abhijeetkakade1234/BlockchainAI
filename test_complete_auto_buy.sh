#!/bin/bash

echo "🤖 Complete Auto-Buy NFT System Demo"
echo "===================================="

USER_ID="testuser"

echo ""
echo "1️⃣ Current wallet state..."
curl -s http://localhost:3001/api/wallet/$USER_ID | jq '.wallet | {balance: .balance.ETH, nftCount: (.nftHoldings | length)}'

echo ""
echo "2️⃣ Creating auto-buy alert: 'buy Cool Cats when it drops below 0.5 ETH'"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "buy Cool Cats when it drops below 0.5 ETH"}' | jq '.message'

echo ""
echo "3️⃣ Creating another auto-buy: 'auto buy BAYC below 12 ETH'"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "auto buy BAYC below 12 ETH"}' | jq '.message'

echo ""
echo "4️⃣ Testing auto-buy with Cool Cats price drop to 0.45 ETH..."
curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\", \"collectionName\": \"Cool Cats\", \"newPrice\": 0.45, \"currency\": \"ETH\"}" | jq '.details.triggeredAlerts'

echo ""
echo "5️⃣ Testing auto-buy with BAYC price drop to 11 ETH..."
curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\", \"collectionName\": \"BAYC\", \"newPrice\": 11, \"currency\": \"ETH\"}" | jq '.details.triggeredAlerts'

echo ""
echo "6️⃣ Final wallet state..."
FINAL_WALLET=$(curl -s http://localhost:3001/api/wallet/$USER_ID)
echo "Balance:"
echo $FINAL_WALLET | jq '.wallet.balance'
echo ""
echo "NFT Holdings:"
echo $FINAL_WALLET | jq '.wallet.nftHoldings | length'
echo ""
echo "Latest NFTs:"
echo $FINAL_WALLET | jq '.wallet.nftHoldings[-2:] | .[] | {name, collection, purchasePrice, purchaseCurrency}'

echo ""
echo "7️⃣ Testing regular purchase vs auto-buy..."
echo "Regular purchase:"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "buy Cool Cats for 0.3 ETH"}' | jq '.message'

echo ""
echo "Final wallet after regular purchase:"
curl -s http://localhost:3001/api/wallet/$USER_ID | jq '.wallet | {balance: .balance.ETH, nftCount: (.nftHoldings | length)}'

echo ""
echo "✅ Complete Auto-Buy System Demo Finished!"
echo ""
echo "🎯 Features Demonstrated:"
echo "   ✅ Natural language auto-buy setup"
echo "   ✅ Price threshold monitoring"
echo "   ✅ Automatic NFT purchasing on price drop"
echo "   ✅ Real-time wallet balance updates"
echo "   ✅ Price emulation for demonstrations"
echo "   ✅ Regular purchases still work"
echo "   ✅ Multiple auto-buy alerts"
echo ""
echo "📝 Auto-Buy Commands Supported:"
echo "   • 'buy [Collection] when it drops below [Price] [Currency]'"
echo "   • 'auto buy [Collection] below [Price] [Currency]'"
echo "   • 'set auto buy for [Collection] at [Price] [Currency]'"
echo "   • 'buy [Collection] if price drops below [Price] [Currency]'"
echo "   • 'alert me to buy [Collection] when below [Price] [Currency]'"
