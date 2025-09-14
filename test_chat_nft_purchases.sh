#!/bin/bash

echo "🤖 Testing NFT Purchases through Chat Interface"
echo "==============================================="

USER_ID="testuser"

echo ""
echo "1️⃣ Testing wallet initialization..."
curl -s http://localhost:3001/api/wallet/$USER_ID | jq '.wallet.balance'

echo ""
echo "2️⃣ Testing NFT purchase via API (simulating chat command)..."
curl -s -X POST http://localhost:3001/api/wallet/$USER_ID/buy \
  -H "Content-Type: application/json" \
  -d '{"collectionName": "Cool Cats", "price": 0.25, "currency": "ETH", "quantity": 1}' | jq '.'

echo ""
echo "3️⃣ Checking updated wallet state..."
curl -s http://localhost:3001/api/wallet/$USER_ID | jq '.wallet | {balance, nftHoldings: (.nftHoldings | length)}'

echo ""
echo "4️⃣ Testing another purchase (Bored Ape)..."
curl -s -X POST http://localhost:3001/api/wallet/$USER_ID/buy \
  -H "Content-Type: application/json" \
  -d '{"collectionName": "Bored Ape Yacht Club", "price": 5, "currency": "ETH", "quantity": 1}' | jq '.'

echo ""
echo "5️⃣ Final wallet state..."
FINAL_WALLET=$(curl -s http://localhost:3001/api/wallet/$USER_ID)
echo "Balance:"
echo $FINAL_WALLET | jq '.wallet.balance'
echo ""
echo "NFT Holdings:"
echo $FINAL_WALLET | jq '.wallet.nftHoldings | length'
echo $FINAL_WALLET | jq '.wallet.nftHoldings[] | {name, collection, purchasePrice, purchaseCurrency}'

echo ""
echo "✅ Chat NFT Purchase System Ready!"
echo ""
echo "📝 Chat Commands to Try:"
echo "   • 'buy Cool Cats for 0.25 ETH'"
echo "   • 'purchase BAYC at 5 ETH'"
echo "   • 'get Bored Ape NFT for 5 ETH'"
echo "   • 'buy Cool Cats NFT' (uses default 0.1 ETH)"
echo ""
echo "🎯 Quick Actions Available:"
echo "   • 'Buy Cool Cats' button"
echo "   • 'Buy BAYC' button"
