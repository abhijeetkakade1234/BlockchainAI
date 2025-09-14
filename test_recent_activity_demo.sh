#!/bin/bash

echo "🎯 Recent Activity Auto-Buy Demo"
echo "================================"

USER_ID="testuser"

echo ""
echo "1️⃣ Creating auto-buy alert: 'buy BAYC when it drops below 20 ETH'"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "buy BAYC when it drops below 20 ETH"}' | jq '.message'

echo ""
echo "2️⃣ Depositing more ETH for the purchase..."
curl -s -X POST http://localhost:3001/api/wallet/$USER_ID/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": 25, "currency": "ETH"}' | jq '.message'

echo ""
echo "3️⃣ Emulating BAYC price drop to trigger auto-buy..."
curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\", \"collectionName\": \"BAYC\", \"newPrice\": 18, \"currency\": \"ETH\"}" | jq '.details.triggeredAlerts'

echo ""
echo "4️⃣ Creating another auto-buy alert: 'buy Cool Cats when it drops below 0.6 ETH'"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "buy Cool Cats when it drops below 0.6 ETH"}' | jq '.message'

echo ""
echo "5️⃣ Emulating Cool Cats price drop..."
curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\", \"collectionName\": \"Cool Cats\", \"newPrice\": 0.55, \"currency\": \"ETH\"}" | jq '.details.triggeredAlerts'

echo ""
echo "6️⃣ Recent Transactions with Auto-Buy Details:"
echo "=============================================="
curl -s http://localhost:3001/api/wallet/$USER_ID/transactions | jq '.transactions[0:3] | .[] | {
  type: .type,
  collection: .collectionName,
  amount: (.amount | tostring) + " " + .currency,
  triggerPrice: (.triggerPrice | tostring) + " " + .currency,
  purchasePrice: (.purchasePrice | tostring) + " " + .currency,
  previousPrice: (.previousPrice | tostring) + " " + .currency,
  timestamp: .timestamp
}'

echo ""
echo "7️⃣ Current Wallet Balance:"
curl -s http://localhost:3001/api/wallet/$USER_ID | jq '.wallet.balance'

echo ""
echo "8️⃣ NFT Holdings:"
curl -s http://localhost:3001/api/wallet/$USER_ID | jq '.wallet.nftHoldings | length'

echo ""
echo "✅ Recent Activity Demo Complete!"
echo ""
echo "🎯 Features Demonstrated:"
echo "   ✅ Auto-buy alerts created via Gemini chat"
echo "   ✅ Price emulation triggers auto-buy execution"
echo "   ✅ Detailed transaction history with price information"
echo "   ✅ Real-time wallet balance and NFT holdings updates"
echo "   ✅ Recent Activity shows:"
echo "      • Collection name and purchase amount"
echo "      • Trigger price vs actual price drop"
echo "      • Purchase price vs market price"
echo "      • Complete auto-buy transaction details"
echo ""
echo "💡 The Recent Activity section now shows:"
echo "   • Auto-Buy badge for automated purchases"
echo "   • Price drop details (previous → trigger)"
echo "   • Actual purchase price information"
echo "   • Real-time transaction updates"
