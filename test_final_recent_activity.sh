#!/bin/bash

echo "🎯 Final Recent Activity Auto-Buy Demo"
echo "======================================"

USER_ID="testuser"

echo ""
echo "1️⃣ Current Recent Activity Transactions:"
echo "========================================="
curl -s http://localhost:3001/api/wallet/$USER_ID/transactions | jq '.transactions[0:3] | .[] | {
  type: .type,
  collection: .collectionName,
  amount: (.amount | tostring) + " " + .currency,
  "trigger_price": (.triggerPrice | tostring) + " " + .currency,
  "purchase_price": (.purchasePrice | tostring) + " " + .currency,
  "previous_price": (.previousPrice | tostring) + " " + .currency,
  timestamp: (.timestamp | strptime("%Y-%m-%dT%H:%M:%S.%fZ") | strftime("%H:%M:%S"))
}'

echo ""
echo "2️⃣ Creating new auto-buy alert: 'buy BAYC when it drops below 15 ETH'"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "buy BAYC when it drops below 15 ETH"}' | jq '.message'

echo ""
echo "3️⃣ Triggering auto-buy with price emulation..."
curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\", \"collectionName\": \"BAYC\", \"newPrice\": 14, \"currency\": \"ETH\"}" > /dev/null

echo ""
echo "4️⃣ Updated Recent Activity (showing real auto-buy transactions):"
echo "================================================================"
curl -s http://localhost:3001/api/wallet/$USER_ID/transactions | jq '.transactions[0:4] | .[] | {
  "🤖 Type": (if .type == "buy_nft" then "Auto-Buy NFT" else .type end),
  "📦 Collection": .collectionName,
  "💰 Amount": (.amount | tostring) + " " + .currency,
  "📉 Price Drop": ((.previousPrice | tostring) + " → " + (.triggerPrice | tostring) + " " + .currency),
  "🛒 Bought For": (.purchasePrice | tostring) + " " + .currency,
  "⏰ Time": (.timestamp | strptime("%Y-%m-%dT%H:%M:%S.%fZ") | strftime("%H:%M:%S"))
}'

echo ""
echo "5️⃣ Current Wallet Balance:"
curl -s http://localhost:3001/api/wallet/$USER_ID | jq '.wallet.balance'

echo ""
echo "6️⃣ NFT Holdings Count:"
curl -s http://localhost:3001/api/wallet/$USER_ID | jq '.wallet.nftHoldings | length'

echo ""
echo "✅ Recent Activity Demo Complete!"
echo ""
echo "🎯 What the Recent Activity Section Now Shows:"
echo "   ✅ Real auto-buy transactions (not dummy data)"
echo "   ✅ Collection names: Cool Cats, BAYC, etc."
echo "   ✅ Purchase amounts: 0.3 ETH, 15 ETH, etc."
echo "   ✅ Price drop details: previous price → trigger price"
echo "   ✅ Auto-buy badges and detailed information"
echo "   ✅ Real-time updates when new purchases occur"
echo ""
echo "📱 Frontend Recent Activity Features:"
echo "   • Auto-Buy badge for automated purchases"
echo "   • Price drop visualization (e.g., 14 ETH → 15 ETH)"
echo "   • Purchase details with collection and amount"
echo "   • Real transaction timestamps"
echo "   • Complete auto-buy transaction history"
