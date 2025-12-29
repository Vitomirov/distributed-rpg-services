#!/bin/bash

# --- CONFIGURATION ---
AUTH_URL="http://localhost:3001/api/auth"
CHAR_URL="http://localhost:3002/api/character"
ITEM_URL="http://localhost:3002/api/items"
COMBAT_URL="http://localhost:3003/api/combat"

# IDs matching the seed exactly
CLASS1_ID="69c56550-b39a-440a-a84f-830ca734cfb6"
CLASS2_ID="a1b2c3d4-e5f6-4012-8345-6789abcdef01"
ITEM1_ID="b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e"
ITEM2_ID="c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f"

# Unique suffix to prevent "Name already exists" errors
TS=$(date +%s)
C1_NAME="Character1_$TS"
C2_NAME="Character2_$TS"

echo "🚀 ZENTRIX RPG - SYSTEM SIMULATION 🚀"

# 1. SETUP GAMEMASTER 1 & CHARACTER 1
echo -e "\n1️⃣ Registering/Logging in GameMaster1..."
# We ignore error on register in case user exists, then we login to get fresh token
curl -s -X POST $AUTH_URL/register -H "Content-Type: application/json" -d '{"username":"GameMaster1","password":"123456","role":"GameMaster"}' > /dev/null

TOKEN1=$(curl -s -X POST $AUTH_URL/login -H "Content-Type: application/json" -d '{"username":"GameMaster1","password":"123456"}' | jq -r '.token')

echo "🔹 Creating $C1_NAME..."
CHAR1_RES=$(curl -s -X POST $CHAR_URL -H "Authorization: Bearer $TOKEN1" -H "Content-Type: application/json" \
  -d "{\"name\":\"$C1_NAME\",\"characterClassId\":\"$CLASS2_ID\",\"baseIntelligence\":10,\"baseFaith\":20}")
CHAR1_ID=$(echo $CHAR1_RES | jq -r '.id')

if [ "$CHAR1_ID" == "null" ]; then echo "❌ Character1 Creation Failed: $CHAR1_RES"; exit 1; fi

curl -s -X POST "$ITEM_URL/grant" -H "Authorization: Bearer $TOKEN1" -H "Content-Type: application/json" \
     -d "{\"characterId\":\"$CHAR1_ID\",\"itemId\":\"$ITEM1_ID\"}" > /dev/null

# 2. SETUP GAMEMASTER 2 & CHARACTER 2
echo -e "\n2️⃣ Registering/Logging in GameMaster2..."
curl -s -X POST $AUTH_URL/register -H "Content-Type: application/json" -d '{"username":"GameMaster2","password":"123456","role":"GameMaster"}' > /dev/null

TOKEN2=$(curl -s -X POST $AUTH_URL/login -H "Content-Type: application/json" -d '{"username":"GameMaster2","password":"123456"}' | jq -r '.token')

echo "🔹 Creating $C2_NAME..."
CHAR2_RES=$(curl -s -X POST $CHAR_URL -H "Authorization: Bearer $TOKEN2" -H "Content-Type: application/json" \
  -d "{\"name\":\"$C2_NAME\",\"characterClassId\":\"$CLASS1_ID\",\"health\":100}")
CHAR2_ID=$(echo $CHAR2_RES | jq -r '.id')

if [ "$CHAR2_ID" == "null" ]; then echo "❌ Character2 Creation Failed: $CHAR2_RES"; exit 1; fi

curl -s -X POST "$ITEM_URL/grant" -H "Authorization: Bearer $TOKEN2" -H "Content-Type: application/json" \
     -d "{\"characterId\":\"$CHAR2_ID\",\"itemId\":\"$ITEM2_ID\"}" > /dev/null

echo "✅ Characters ready. IDs: $CHAR1_ID vs $CHAR2_ID"
sleep 2

# 3. COMBAT FLOW
echo -e "\n3️⃣ Initiating Combat ($C1_NAME vs $C2_NAME)..."
DUEL_ID=$(curl -s -X POST $COMBAT_URL/challenge -H "Authorization: Bearer $TOKEN1" -H "Content-Type: application/json" \
  -d "{\"attackerId\":\"$CHAR1_ID\",\"defenderId\":\"$CHAR2_ID\"}" | jq -r '.id')

if [ "$DUEL_ID" == "null" ]; then echo "❌ Combat Initiation Failed!"; exit 1; fi
echo "🏟️ Duel ID: $DUEL_ID"

function combat_step() {
    echo -n "⚔️ Action [$1]: "
    curl -s -X POST "$COMBAT_URL/$DUEL_ID/$1" -H "Authorization: Bearer $TOKEN1" -H "Content-Type: application/json" \
    | jq -c '{status: .status, attackerHp: .attackerHp, defenderHp: .defenderHp}'
    sleep 2.2
}

combat_step "cast"
combat_step "heal"
combat_step "cast"
combat_step "attack"
combat_step "cast"

# 4. FINAL VERIFICATION
echo -e "\n4️⃣ Verifying Winner's Inventory..."
echo "🔍 Checking $C1_NAME items (Should have Item1 and Item2):"
sleep 2
curl -s -X GET "$CHAR_URL/$CHAR1_ID" -H "Authorization: Bearer $TOKEN1" \
| jq -r '.items[] | "📦 Possesses: " + .item.name'

echo -e "\n🏁 Simulation Completed Successfully."