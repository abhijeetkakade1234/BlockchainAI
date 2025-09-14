#!/bin/bash

echo "🤖 Gemini Auto-Buy Integration Demo"
echo "=================================="

USER_ID="testuser"

echo ""
echo "1️⃣ Testing Gemini auto-buy recognition: 'buy Cool Cats when it drops below 0.8 ETH'"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "buy Cool Cats when it drops below 0.8 ETH"}' | jq '.message'

echo ""
echo "2️⃣ Testing Gemini auto-buy with different phrasing: 'auto buy BAYC below 20 ETH'"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "auto buy BAYC below 20 ETH"}' | jq '.message'

echo ""
echo "3️⃣ Testing immediate purchase (custom handler): 'buy Cool Cats for 0.25 ETH'"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "buy Cool Cats for 0.25 ETH"}' | jq '.message'

echo ""
echo "4️⃣ Testing auto-buy execution with price emulation..."
echo "Emulating Cool Cats price drop to 0.75 ETH (should trigger auto-buy)..."
curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\", \"collectionName\": \"Cool Cats\", \"newPrice\": 0.75, \"currency\": \"ETH\"}" | jq '.details.triggeredAlerts'

echo ""
echo "5️⃣ Testing BAYC auto-buy execution..."
echo "Emulating BAYC price drop to 18 ETH (should trigger auto-buy)..."
curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\", \"collectionName\": \"BAYC\", \"newPrice\": 18, \"currency\": \"ETH\"}" | jq '.details.triggeredAlerts'

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
echo "✅ Gemini Auto-Buy Integration Complete!"
echo ""
echo "🎯 Features Demonstrated:"
echo "   ✅ Gemini recognizes auto-buy commands"
echo "   ✅ Auto-buy alerts created via NFT Agent"
echo "   ✅ Immediate purchases handled by custom system"
echo "   ✅ Price emulation triggers auto-buy execution"
echo "   ✅ Complete workflow from command to NFT purchase"
echo ""
echo "📝 Command Types:"
echo "   • Auto-Buy (Gemini): 'buy X when it drops below Y'"
echo "   • Immediate (Custom): 'buy X for Y'"
echo "   • Price Alerts (Gemini): 'notify me when X drops below Y'"
