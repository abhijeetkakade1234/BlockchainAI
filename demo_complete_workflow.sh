#!/bin/bash

echo "🎭 Complete NFT Trading Demo - Dummy Wallet Integration"
echo "======================================================"

USER_ID="demo_user"
COLLECTION="Bored Ape Yacht Club"

echo ""
echo "1️⃣ Creating a price alert..."
ALERT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/alerts \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\", \"collectionName\": \"$COLLECTION\", \"thresholdPrice\": 5, \"thresholdType\": \"below\", \"currency\": \"ETH\"}")
echo $ALERT_RESPONSE | jq '.'

echo ""
echo "2️⃣ Checking initial wallet balance..."
curl -s http://localhost:3001/api/wallet/$USER_ID | jq '.wallet.balance'

echo ""
echo "3️⃣ Emulating price drop to trigger alert..."
EMULATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\", \"collectionName\": \"$COLLECTION\", \"newPrice\": 4.5, \"currency\": \"ETH\"}")
echo $EMULATE_RESPONSE | jq '.'

echo ""
echo "4️⃣ Checking triggered notifications..."
curl -s http://localhost:3001/api/notifications/$USER_ID | jq '.notifications | length'

echo ""
echo "5️⃣ Buying NFT at the emulated price..."
BUY_RESPONSE=$(curl -s -X POST http://localhost:3001/api/wallet/$USER_ID/buy \
  -H "Content-Type: application/json" \
  -d "{\"collectionName\": \"$COLLECTION\", \"price\": 4.5, \"currency\": \"ETH\", \"quantity\": 1}")
echo $BUY_RESPONSE | jq '.'

echo ""
echo "6️⃣ Final wallet state - Balance and NFT Holdings..."
FINAL_WALLET=$(curl -s http://localhost:3001/api/wallet/$USER_ID)
echo "Balance:"
echo $FINAL_WALLET | jq '.wallet.balance'
echo ""
echo "NFT Holdings:"
echo $FINAL_WALLET | jq '.wallet.nftHoldings | length'
echo $FINAL_WALLET | jq '.wallet.nftHoldings[0] | {name, collection, purchasePrice, purchaseCurrency}'

echo ""
echo "7️⃣ Transaction History:"
echo $FINAL_WALLET | jq '.wallet.transactionHistory | length'
echo $FINAL_WALLET | jq '.wallet.transactionHistory[0] | {type, amount, currency, collectionName, timestamp}'

echo ""
echo "✅ Complete workflow demonstrated successfully!"
echo "📈 Portfolio Performance:"
TOTAL_SPENT=$(echo $FINAL_WALLET | jq '.wallet.transactionHistory | map(select(.type == "buy") | .amount) | add')
NFT_COUNT=$(echo $FINAL_WALLET | jq '.wallet.nftHoldings | length')
echo "   • NFTs Purchased: $NFT_COUNT"
echo "   • Total Invested: $TOTAL_SPENT ETH"
echo "   • Average Price: $(echo "scale=4; $TOTAL_SPENT / $NFT_COUNT" | bc) ETH per NFT"
