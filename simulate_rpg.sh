#!/bin/bash

# --- CONFIGURATION ---
AUTH_URL="http://localhost:3001/api/auth"
CHAR_URL="http://localhost:3002/api/character"
ITEM_URL="http://localhost:3002/api/items"
COMBAT_URL="http://localhost:3003/api/combat"

# Fixed IDs from seed.ts
WARRIOR_ID="69c56550-b39a-440a-a84f-830ca734cfb6"
MAGE_ID="a1b2c3d4-e5f6-4012-8345-6789abcdef01"
STAFF_ID="c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f"
SWORD_ID="b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e"

echo "🚀 ZENTRIX RPG - FULL SYSTEM SIMULATION 🚀"

# 1. AUTH FLOW
GM_USER="GM_$(date +%s)"
echo -e "\n1️⃣ Registering and logging in GameMaster ($GM_USER)..."
curl -s -X POST $AUTH_URL/register -H "Content-Type: application/json" \
     -d "{\"username\":\"$GM_USER\",\"password\":\"123456\",\"role\":\"GameMaster\"}" > /dev/null

TOKEN=$(curl -s -X POST $AUTH_URL/login -H "Content-Type: application/json" \
        -d "{\"username\":\"$GM_USER\",\"password\":\"123456\"}" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then 
    echo "❌ Error: Authentication failed. Ensure services are running!"
    exit 1
fi
echo "✅ Token successfully acquired."

# 2. CHARACTER CREATION
echo -e "\n2️⃣ Creating characters (Ranni and Radahn)..."
RANNI_ID=$(curl -s -X POST $CHAR_URL -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"name\":\"Ranni_$GM_USER\",\"characterClassId\":\"$MAGE_ID\",\"baseIntelligence\":30,\"baseFaith\":20}" | jq -r '.id')

RADAHN_ID=$(curl -s -X POST $CHAR_URL -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"name\":\"Radahn_$GM_USER\",\"characterClassId\":\"$WARRIOR_ID\",\"health\":200}" | jq -r '.id')

echo "✅ Ranni ID: $RANNI_ID"
echo "✅ Radahn ID: $RADAHN_ID"

# 3. ITEM MANAGEMENT (GRANT & GIFT)
echo -e "\n3️⃣ Testing Item Management (Grant & Gift)..."

echo "🔹 Grant: Assigning Dragon Slayer to Radahn..."
curl -s -X POST "$ITEM_URL/grant" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
     -d "{\"characterId\":\"$RADAHN_ID\",\"itemId\":\"$SWORD_ID\"}" | jq -c

echo "🔹 Grant: Assigning Mystic Staff to Ranni..."
curl -s -X POST "$ITEM_URL/grant" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
     -d "{\"characterId\":\"$RANNI_ID\",\"itemId\":\"$STAFF_ID\"}" | jq -c

echo "🔹 Gift: Ranni transferring (gifting) her Staff to Radahn..."
curl -s -X POST "$ITEM_URL/gift" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
     -d "{\"fromCharacterId\":\"$RANNI_ID\",\"toCharacterId\":\"$RADAHN_ID\",\"itemId\":\"$STAFF_ID\"}" | jq -c

# 4. COMBAT FLOW
echo -e "\n4️⃣ Initiating Combat (Challenge)..."
DUEL_ID=$(curl -s -X POST $COMBAT_URL/challenge -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"attackerId\":\"$RANNI_ID\",\"defenderId\":\"$RADAHN_ID\"}" | jq -r '.id')

echo "🏟️ Duel ID: $DUEL_ID"

function action() {
    echo -n "⚔️ $1 action: "
    curl -s -X POST "$COMBAT_URL/$DUEL_ID/$1" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    | jq -c '{status: .status, attackerHp: .attackerHp, defenderHp: .defenderHp}'
    sleep 2.2
}

action "cast"   # 60 dmg
action "heal"   # Ranni heals for 20
action "cast"   # 60 dmg
action "attack" # ~20 dmg
action "cast"   # Finishing move

# 5. FINAL VERIFICATION
echo -e "\n5️⃣ Verifying Winner and Loot Transfer..."
echo "🔍 Winner's Inventory (Ranni) - checking for looted items from Radahn:"
curl -s -X GET "$CHAR_URL/$RANNI_ID" -H "Authorization: Bearer $TOKEN" | jq '.items[] | {itemName: .item.name}'

echo -e "\n🏁 Simulation completed successfully!"