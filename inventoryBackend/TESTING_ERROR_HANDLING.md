# Error Handling Testing Guide

This guide shows how to trigger errors in each migrated route and where to view the error logs.

## 📍 Where to View Logs

### Console Output (Development)
All errors are logged to the console where your backend server is running. You'll see structured logs like:

```
================================================================================
[ERROR] 2025-12-29T21:30:45.123Z
Request: POST /api/auth/login
User: anonymous
Status: 401
Message: Invalid email or password
================================================================================
```

### Error Response (Client)
The client receives a JSON response:
```json
{
  "error": "Invalid email or password",
  "status": 401
}
```

In **development mode**, you'll also get stack traces:
```json
{
  "error": "Invalid email or password",
  "status": 401,
  "stack": "UnauthorizedError: Invalid email or password\n    at ..."
}
```

---

## 🧪 Testing Each Route

### 1. authRoute.js

#### **POST /api/auth/register** - Registration
**How to trigger error:**
```bash
curl -X POST http://localhost:5555/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "12345"
  }'
```
**Expected Error:** `422 Validation failed`
- Missing `inviteToken`
- Password too short (< 6 characters)

**Where to see log:**
- Backend console: Full error log with validation errors array
- Response body: `{"error": "Validation failed", "status": 422, "validationErrors": ["Invite token is required", "Password must be at least 6 characters"]}`

---

#### **POST /api/auth/login** - Login
**How to trigger error:**
```bash
curl -X POST http://localhost:5555/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpassword"
  }'
```
**Expected Error:** `401 Unauthorized - Invalid email or password`

**Where to see log:**
- Backend console: Shows failed login attempt
- Response: `{"error": "Invalid email or password", "status": 401}`

---

#### **POST /api/auth/refresh** - Refresh Token
**How to trigger error:**
```bash
curl -X POST http://localhost:5555/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "invalid_token_here"
  }'
```
**Expected Error:** `401 Unauthorized - Invalid token`

**Where to see log:**
- Backend console: Token verification failure
- Response: `{"error": "Invalid token", "status": 401}`

---

#### **POST /api/auth/logout** - Logout
**How to trigger error:**
```bash
curl -X POST http://localhost:5555/api/auth/logout
```
**Expected Error:** `401 Unauthorized - Invalid or missing token`

**Where to see log:**
- Backend console: Missing authorization header
- Response: `{"error": "Unauthorized", "status": 401}`

---

#### **POST /api/auth/verify-email** - Email Verification
**How to trigger error:**
```bash
curl -X POST http://localhost:5555/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invalid_verification_token"
  }'
```
**Expected Error:** `400 Bad Request - Invalid or expired verification token`

**Where to see log:**
- Backend console: Verification token not found
- Response: `{"error": "Invalid or expired verification token", "status": 400}`

---

### 2. inviteRoute.js

#### **POST /api/invites** - Create Invite (Admin Only)
**How to trigger error:**
```bash
curl -X POST http://localhost:5555/api/invites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "email": "newuser@example.com"
  }'
```
**Expected Error:** `403 Forbidden - Admin access required`

**Where to see log:**
- Backend console: Non-admin attempting admin action
- Response: `{"error": "Forbidden", "status": 403}`

---

#### **DELETE /api/invites/:id** - Delete Invite
**How to trigger error:**
```bash
curl -X DELETE http://localhost:5555/api/invites/99999 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected Error:** `404 Not Found - Invitation not found`

**Where to see log:**
- Backend console: Invite ID 99999 not found
- Response: `{"error": "Invitation not found", "status": 404}`

---

### 3. userRoute.js

#### **PATCH /api/users/:id/role** - Update User Role
**How to trigger error:**
```bash
curl -X PATCH http://localhost:5555/api/users/1/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "role": "superuser"
  }'
```
**Expected Error:** `400 Bad Request - Invalid role. Must be "admin" or "user"`

**Where to see log:**
- Backend console: Invalid role attempted
- Response: `{"error": "Invalid role. Must be \"admin\" or \"user\"", "status": 400}`

---

#### **DELETE /api/users/:id** - Delete User
**How to trigger error:**
```bash
curl -X DELETE http://localhost:5555/api/users/99999 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected Error:** `404 Not Found - User not found`

**Where to see log:**
- Backend console: User ID 99999 not found
- Response: `{"error": "User not found", "status": 404}`

---

### 4. coinRoute.js

#### **POST /api/coins** - Create Coin
**How to trigger error:**
```bash
curl -X POST http://localhost:5555/api/coins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "Quarter",
    "mintyear": "2020"
  }'
```
**Expected Error:** `400 Bad Request - Missing required fields`

**Where to see log:**
- Backend console: Missing mintlocation, circulation, grade
- Response: `{"error": "One of the type, mintlocation, mintyear, circulation, grade data points is missing", "status": 400}`

---

#### **GET /api/coins/:id** - Get Coin by ID
**How to trigger error:**
```bash
curl http://localhost:5555/api/coins/99999 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Error:** `404 Not Found - Coin not found`

**Where to see log:**
- Backend console: Coin ID 99999 not found in database
- Response: `{"error": "this coin is not in the database", "status": 404}`

---

#### **POST /api/coins/upload/:id** - Upload Images
**How to trigger error:**
```bash
curl -X POST http://localhost:5555/api/coins/upload/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Error:** `400 Bad Request - No files uploaded`

**Where to see log:**
- Backend console: Upload attempted without files
- Response: `{"error": "No files uploaded", "status": 400}`

---

### 5. mintRoute.js

#### **GET /api/mintlocations/:id** - Get Mint Location
**How to trigger error:**
```bash
curl http://localhost:5555/api/mintlocations/99999 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Error:** `404 Not Found - Mint location not found`

**Where to see log:**
- Backend console: Mint location ID 99999 not found
- Response: `{"error": "Mint location not found", "status": 404}`

---

### 6. coinTypeRoute.js

#### **POST /api/cointypes** - Create Coin Type
**How to trigger error:**
```bash
curl -X POST http://localhost:5555/api/cointypes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'
```
**Expected Error:** `400 Bad Request - Missing required fields`

**Where to see log:**
- Backend console: Missing name field
- Response: `{"error": "Name is required", "status": 400}`

---

### 7. relicRoute.js

#### **DELETE /api/relics/:id** - Delete Relic
**How to trigger error:**
```bash
curl -X DELETE http://localhost:5555/api/relics/99999 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Error:** `404 Not Found - Relic not found`

**Where to see log:**
- Backend console: Relic ID 99999 not found
- Response: `{"error": "Relic not found", "status": 404}`

---

### 8. relicTypeRoute.js

#### **PUT /api/relictypes/:id** - Update Relic Type
**How to trigger error:**
```bash
curl -X PUT http://localhost:5555/api/relictypes/99999 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Updated Type"
  }'
```
**Expected Error:** `404 Not Found - Relic type not found`

**Where to see log:**
- Backend console: Relic type ID 99999 not found
- Response: `{"error": "Relic type not found", "status": 404}`

---

### 9. stampRoute.js

#### **GET /api/stamps/:id** - Get Stamp by ID
**How to trigger error:**
```bash
curl http://localhost:5555/api/stamps/99999 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Error:** `404 Not Found - Stamp not found`

**Where to see log:**
- Backend console: Stamp ID 99999 not found
- Response: `{"error": "Stamp not found", "status": 404}`

---

### 10. bunnykinRoute.js

#### **POST /api/bunnykins** - Create Bunnykin
**How to trigger error:**
```bash
curl -X POST http://localhost:5555/api/bunnykins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'
```
**Expected Error:** `400 Bad Request - Missing required fields`

**Where to see log:**
- Backend console: Missing required bunnykin fields
- Response: `{"error": "Missing required fields", "status": 400}`

---

### 11. comicRoute.js

#### **PUT /api/comics/:id** - Update Comic
**How to trigger error:**
```bash
curl -X PUT http://localhost:5555/api/comics/99999 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated Comic"
  }'
```
**Expected Error:** `404 Not Found - Comic not found`

**Where to see log:**
- Backend console: Comic ID 99999 not found
- Response: `{"error": "Comic not found", "status": 404}`

---

### 12. comicPublisherRoute.js

#### **DELETE /api/comicpublishers/:id** - Delete Publisher
**How to trigger error:**
```bash
curl -X DELETE http://localhost:5555/api/comicpublishers/99999 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Error:** `404 Not Found - Publisher not found`

**Where to see log:**
- Backend console: Publisher ID 99999 not found
- Response: `{"error": "Publisher not found", "status": 404}`

---

## 🔍 Testing 404 for Undefined Routes

**How to trigger:**
```bash
curl http://localhost:5555/api/nonexistent/route \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Error:** `404 Not Found - Route not found`

**Where to see log:**
- Backend console: Route not found error
- Response: `{"error": "Route not found: GET /api/nonexistent/route", "status": 404}`

---

## 🛠️ Quick Test Script

Save this as `test-errors.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5555"

echo "Testing Error Handling..."
echo "========================"

# Test 1: Bad login
echo "\n1. Testing bad login (401)..."
curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@test.com","password":"wrong"}' | jq

# Test 2: Missing fields
echo "\n2. Testing missing fields (400)..."
curl -s -X POST $BASE_URL/api/coins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"type":"Quarter"}' | jq

# Test 3: Not found
echo "\n3. Testing not found (404)..."
curl -s $BASE_URL/api/coins/99999 \
  -H "Authorization: Bearer YOUR_TOKEN" | jq

# Test 4: Undefined route
echo "\n4. Testing undefined route (404)..."
curl -s $BASE_URL/api/nonexistent | jq

echo "\n✅ Error testing complete!"
```

Run with: `chmod +x test-errors.sh && ./test-errors.sh`

---

## 📊 Error Log Format

When an error occurs, you'll see this format in your backend console:

```
================================================================================
[ERROR] 2025-12-29T21:30:45.123Z
Request: POST /api/coins
User: 42
Status: 400
Message: One of the type, mintlocation, mintyear, circulation, grade data points is missing
================================================================================
```

For **unexpected errors** (500s), you'll also see the full stack trace:
```
================================================================================
[ERROR] 2025-12-29T21:30:45.123Z
Request: POST /api/coins/estimate/123
User: 42
Status: 500
Message: Cannot read property 'id' of undefined
Stack trace:
Error: Cannot read property 'id' of undefined
    at /Users/.../coinRoute.js:234:15
    at asyncHandler (/Users/.../errorHandler.js:112:5)
    ...
================================================================================
```

---

## 🎯 Pro Tips

1. **Use Postman or Insomnia** for easier testing with collections
2. **Check browser DevTools Network tab** for frontend errors
3. **Monitor backend console** in real-time during development
4. **Use `NODE_ENV=development`** to see stack traces
5. **Test with invalid tokens** to verify auth errors
6. **Try missing/extra fields** to test validation

---

## ✅ Verification Checklist

After testing, verify:
- [ ] Errors return correct HTTP status codes (400, 401, 403, 404, 500)
- [ ] Error messages are descriptive and helpful
- [ ] Logs appear in backend console with timestamp and context
- [ ] Stack traces only show in development mode
- [ ] ValidationError returns array of specific errors
- [ ] No sensitive information leaked in error messages
- [ ] 404 handler catches undefined routes
- [ ] Auth errors properly identify missing/invalid tokens
