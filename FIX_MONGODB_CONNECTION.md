# Fix MongoDB Connection Error on Render

## Error Message
```
Error: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
```

This error means your application is trying to connect to **localhost** (127.0.0.1) instead of a remote MongoDB database.

## Root Cause
The MongoDB connection string environment variable is either:
1. **Not set** in Render's environment variables
2. **Set but empty/undefined**
3. **Pointing to localhost** instead of a remote database

## Solution

### Step 1: Get Your MongoDB Connection String

You need a **remote MongoDB database**. If you don't have one:

#### Option A: Use MongoDB Atlas (Recommended - Free tier available)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (free tier M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
6. Replace `<password>` with your database user password
7. Replace `<database>` with your database name (e.g., `quantum_dashboard`)

#### Option B: Use Your Existing MongoDB Atlas Cluster
1. Go to MongoDB Atlas dashboard
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Copy the connection string

### Step 2: Set Environment Variable in Render

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add or update the following variable:

   **Variable Name**: `MONGO_URL_prod`
   
   **Value**: Your MongoDB Atlas connection string
   
   Example:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/quantum_dashboard?retryWrites=true&w=majority
   ```

   **OR** use:
   
   **Variable Name**: `MONGO_URI`
   
   **Value**: Same connection string

### Step 3: Verify NODE_ENV is Set

Render usually sets this automatically, but verify:

**Variable Name**: `NODE_ENV`
**Value**: `production`

If not set, add it manually.

### Step 4: Configure MongoDB Atlas Network Access

1. Go to MongoDB Atlas dashboard
2. Click **Network Access** in the left sidebar
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (for Render's dynamic IPs)
   - OR add Render's specific IP addresses if you know them
5. Click **Confirm**

### Step 5: Verify Database User

1. Go to MongoDB Atlas dashboard
2. Click **Database Access** in the left sidebar
3. Ensure you have a database user created
4. Note the username and password (you'll need these in the connection string)

### Step 6: Redeploy

After setting the environment variables:
1. Render will automatically redeploy, OR
2. Go to **Manual Deploy** → **Deploy latest commit**

### Step 7: Check Logs

After redeployment, check Render logs. You should see:
```
[DB Config] NODE_ENV: production
[DB Config] Checking MONGO_URL_prod: Found
[DB Config] Attempting to connect to MongoDB...
[DB Config] ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

## Troubleshooting

### Still Getting Connection Refused?

1. **Check the connection string format**:
   - ✅ Correct: `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
   - ❌ Wrong: `mongodb://localhost:27017/dbname`
   - ❌ Wrong: `mongodb://127.0.0.1:27017/dbname`

2. **Verify password encoding**:
   - If your password has special characters, URL-encode them
   - Example: `@` becomes `%40`, `#` becomes `%23`

3. **Check MongoDB Atlas Network Access**:
   - Ensure "Allow Access from Anywhere" (0.0.0.0/0) is enabled
   - OR add Render's IP addresses

4. **Verify database user permissions**:
   - User should have "Read and write to any database" or specific database access

5. **Check Render logs for detailed error**:
   - The improved error handling will show which environment variables are set
   - Look for `[DB Config]` messages in the logs

### Connection String Examples

**MongoDB Atlas (Recommended)**:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/quantum_dashboard?retryWrites=true&w=majority
```

**MongoDB Atlas with specific options**:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/quantum_dashboard?retryWrites=true&w=majority&appName=QuantumDashboard
```

## Quick Checklist

- [ ] MongoDB Atlas cluster created (or existing cluster available)
- [ ] Database user created with password
- [ ] Network Access configured (Allow from anywhere or Render IPs)
- [ ] Connection string copied from MongoDB Atlas
- [ ] `MONGO_URL_prod` or `MONGO_URI` set in Render environment variables
- [ ] `NODE_ENV=production` set in Render (usually automatic)
- [ ] Service redeployed after setting environment variables
- [ ] Logs show successful MongoDB connection

## Need Help?

If you're still having issues:
1. Check Render logs for `[DB Config]` messages - they show what's being checked
2. Verify the connection string works by testing it locally first
3. Ensure MongoDB Atlas cluster is running (not paused)

