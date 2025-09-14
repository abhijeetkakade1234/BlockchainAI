#!/bin/bash

echo "🧪 Testing NFT Agent Integration"
echo "================================"

# Test 1: Server Health Check
echo "1. Testing server health..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
if [[ $HEALTH_RESPONSE == *"OK"* ]]; then
    echo "✅ Server health check passed"
else
    echo "❌ Server health check failed"
    exit 1
fi

# Test 2: Balance Query
echo "2. Testing balance query..."
BALANCE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/chat \
    -H "Content-Type: application/json" \
    -d '{"query": "What is my wallet balance?"}')
if [[ $BALANCE_RESPONSE == *"balance"* ]]; then
    echo "✅ Balance query test passed"
    echo "   Response: $BALANCE_RESPONSE"
else
    echo "❌ Balance query test failed"
    exit 1
fi

# Test 3: Address Query
echo "3. Testing address query..."
ADDRESS_RESPONSE=$(curl -s -X POST http://localhost:3001/api/chat \
    -H "Content-Type: application/json" \
    -d '{"query": "What is my wallet address?"}')
if [[ $ADDRESS_RESPONSE == *"address"* ]]; then
    echo "✅ Address query test passed"
    echo "   Response: $ADDRESS_RESPONSE"
else
    echo "❌ Address query test failed"
    exit 1
fi

# Test 4: NFT Floor Price Query
echo "4. Testing NFT floor price query..."
NFT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/chat \
    -H "Content-Type: application/json" \
    -d '{"query": "Get floor price for Bored Ape Yacht Club"}')
if [[ $NFT_RESPONSE == *"floor_price"* ]]; then
    echo "✅ NFT floor price test passed"
    echo "   Response: $NFT_RESPONSE"
else
    echo "❌ NFT floor price test failed"
    exit 1
fi

# Test 5: Frontend Accessibility
echo "5. Testing frontend accessibility..."
FRONTEND_RESPONSE=$(curl -s -I http://localhost:3000 | head -1)
if [[ $FRONTEND_RESPONSE == *"200"* ]]; then
    echo "✅ Frontend accessibility test passed"
else
    echo "❌ Frontend accessibility test failed"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Integration is working correctly."
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 API Server: http://localhost:3001"
echo ""
echo "You can now:"
echo "- Open http://localhost:3000 in your browser"
echo "- Use the chat interface to interact with the NFT Agent"
echo "- Try queries like:"
echo "  • 'What is my wallet balance?'"
echo "  • 'What is my wallet address?'"
echo "  • 'Show me my NFTs'"
echo "  • 'Get floor price for Bored Ape Yacht Club'"
