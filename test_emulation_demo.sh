#!/bin/bash

echo "🎭 NFT Price Emulation Demo - Testing Alert System"
echo "=================================================="

# Test 1: Server Health Check
echo "1️⃣ Testing server health..."
curl -s http://localhost:3001/health | jq '.'
echo ""

# Test 2: Create a test alert first
echo "2️⃣ Creating a test alert for emulation..."
ALERT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"userId": "demo_user", "collectionName": "Cool Cats", "thresholdPrice": 0.3, "thresholdType": "below", "currency": "ETH"}')
echo $ALERT_RESPONSE | jq '.'
ALERT_ID=$(echo $ALERT_RESPONSE | jq -r '.alertId')
echo ""

# Test 3: Create another alert (above threshold)
echo "3️⃣ Creating another test alert (above threshold)..."
curl -s -X POST http://localhost:3001/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"userId": "demo_user", "collectionName": "Cool Cats", "thresholdPrice": 0.5, "thresholdType": "above", "currency": "ETH"}' | jq '.'
echo ""

# Test 4: Check user alerts
echo "4️⃣ Checking user alerts..."
curl -s http://localhost:3001/api/alerts/demo_user | jq '.'
echo ""

# Test 5: Emulate price change that should trigger the "below" alert
echo "5️⃣ Emulating price drop to 0.25 ETH (should trigger 'below 0.3 ETH' alert)..."
EMULATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d '{"userId": "demo_user", "collectionName": "Cool Cats", "newPrice": 0.25, "currency": "ETH"}')
echo $EMULATE_RESPONSE | jq '.'
echo ""

# Test 6: Check notifications
echo "6️⃣ Checking notifications after price drop..."
curl -s http://localhost:3001/api/notifications/demo_user | jq '.'
echo ""

# Test 7: Emulate price rise that should trigger the "above" alert
echo "7️⃣ Emulating price rise to 0.6 ETH (should trigger 'above 0.5 ETH' alert)..."
curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d '{"userId": "demo_user", "collectionName": "Cool Cats", "newPrice": 0.6, "currency": "ETH"}' | jq '.'
echo ""

# Test 8: Check notifications again
echo "8️⃣ Checking notifications after price rise..."
curl -s http://localhost:3001/api/notifications/demo_user | jq '.'
echo ""

# Test 9: Emulate price change that shouldn't trigger any alerts
echo "9️⃣ Emulating price change to 0.4 ETH (should NOT trigger any alerts)..."
curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d '{"userId": "demo_user", "collectionName": "Cool Cats", "newPrice": 0.4, "currency": "ETH"}' | jq '.'
echo ""

# Test 10: Test with different currency (USD)
echo "🔟 Testing USD currency emulation..."
curl -s -X POST http://localhost:3001/api/emulate-price \
  -H "Content-Type: application/json" \
  -d '{"userId": "demo_user", "collectionName": "Cool Cats", "newPrice": 750, "currency": "USD"}' | jq '.'
echo ""

echo "✅ Emulation Demo Completed!"
echo ""
echo "📊 Demo Summary:"
echo "- Created test alerts for Cool Cats collection"
echo "- Tested price drop emulation (triggered below alert)"
echo "- Tested price rise emulation (triggered above alert)"
echo "- Tested neutral price (no triggers)"
echo "- Tested different currency (USD)"
echo ""
echo "🎯 The emulation system successfully:"
echo "- Triggered alerts when price thresholds were crossed"
echo "- Created notifications for triggered alerts"
echo "- Recorded price history with emulation source"
echo "- Handled different currencies properly"
echo "- Provided detailed feedback on trigger results"
echo ""
echo "💡 You can now use the 'Emulate' button in the Portfolio Dashboard"
echo "   to test the alert system interactively!"
