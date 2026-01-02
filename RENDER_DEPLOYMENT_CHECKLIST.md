# Render Deployment Checklist

This checklist helps ensure your backend is properly configured for Render deployment.

## ✅ Code Changes Completed

- [x] Fixed `package.json` start script (changed from `nodemon` to `node`)
- [x] Moved `nodemon` to devDependencies
- [x] Added `dev` script for local development
- [x] Added health check endpoint at `/health`

## 🔧 Render Dashboard Configuration

### 1. Service Settings
Verify these settings in your Render service dashboard:

- **Root Directory**: Set to `Back-end` (if your repo root is the project root)
- **Build Command**: `npm install` (or `npm ci` for faster builds)
- **Start Command**: `npm start` (this will use the fixed start script)

### 2. Environment Variables
Ensure these environment variables are set in Render's Environment tab:

#### Required Variables:
- `NODE_ENV` = `production` (usually set automatically by Render)
- `PORT` = (automatically set by Render, don't override)
- `MONGO_URL_prod` = Your MongoDB production connection string
  - OR `MONGO_URI` = Your MongoDB connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- `JWT_SECRET` = Your JWT secret key (use a strong random string)

#### AWS Configuration (if using S3):
- `AWS_REGION` = Your AWS region (e.g., `us-east-1`)
- `AWS_BUCKET_NAME` = Your S3 bucket name
- `AWS_ACCESS_KEY_ID` = Your AWS access key
- `AWS_SECRET_ACCESS_KEY` = Your AWS secret key

#### Email Configuration (if using Nodemailer):
- `EMAIL_HOST` = Your SMTP host
- `EMAIL_PORT` = Your SMTP port
- `EMAIL_USER` = Your email username
- `EMAIL_PASS` = Your email password

### 3. Database Access
If using MongoDB Atlas:
- Ensure your Render service IP is whitelisted in MongoDB Atlas Network Access
- OR set MongoDB Atlas to allow access from anywhere (0.0.0.0/0) for Render's dynamic IPs

## 🧪 Testing After Deployment

1. **Check Health Endpoint**:
   ```
   GET https://your-service.onrender.com/health
   ```
   Should return: `{ "status": "ok", "timestamp": "...", "environment": "production" }`

2. **Check Logs**:
   - Go to Render dashboard → Logs tab
   - Verify: "MongoDB Connected: ..." message appears
   - Verify: "Server Running at [port]" message appears
   - Check for any error messages

3. **Test API Endpoints**:
   - Test authentication: `POST /auth/login`
   - Test a protected route with JWT token

## 🐛 Common Issues & Solutions

### Issue: "nodemon: command not found"
**Solution**: Already fixed - start script now uses `node` instead of `nodemon`

### Issue: "MongoDB URI is not defined"
**Solution**: 
- Check that `MONGO_URL_prod` or `MONGO_URI` is set in Render environment variables
- Verify the variable name matches exactly (case-sensitive)

### Issue: "Cannot connect to MongoDB"
**Solution**:
- Verify MongoDB connection string format
- Check MongoDB Atlas network access settings
- Ensure IP whitelist includes Render's IPs or allows all (0.0.0.0/0)

### Issue: "Port already in use"
**Solution**: 
- Ensure you're using `process.env.PORT` (already correct in code)
- Render automatically sets the PORT variable

### Issue: Service crashes immediately
**Solution**:
- Check Render logs for specific error messages
- Verify all required environment variables are set
- Check database connection string format

## 📝 Local Development

For local development, use:
```bash
npm run dev
```
This uses nodemon for auto-restart on file changes.

For production-like testing locally:
```bash
npm start
```

## 🔍 Verification Commands

After deployment, you can verify the setup:

1. **Health Check**:
   ```bash
   curl https://your-service.onrender.com/health
   ```

2. **Check Environment** (if you add a debug endpoint):
   ```bash
   # Note: Don't expose sensitive env vars in production
   ```

## 📞 Next Steps

1. Commit and push these changes to your repository
2. Render will automatically redeploy
3. Check the logs in Render dashboard
4. Test the health endpoint
5. Verify all API endpoints work correctly

