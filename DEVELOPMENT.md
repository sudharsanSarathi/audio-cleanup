# 🛠️ Development Guide - Avoid CORS Errors

## 🚨 **The Problem You're Seeing**

You're getting CORS errors because you're opening the HTML file directly in your browser (`file:///` protocol) instead of running it through a web server. Browsers block API calls from local files for security reasons.

## ✅ **Solution: Run the Development Server**

### **Step 1: Start the Server**
```bash
# Make sure you're in the project directory
cd "Audio noce cleanup"

# Install dependencies (if not done already)
npm install

# Start the development server
npm start
```

### **Step 2: Access the Application**
Instead of opening the HTML file directly, go to:
**http://localhost:3000**

### **Step 3: Test File Upload**
1. Open http://localhost:3000 in your browser
2. Upload an audio/video file
3. Choose processing options
4. Click "Start Processing"

## 🔧 **Alternative Development Methods**

### **Method 1: Using the Start Script**
```bash
# Use the provided start script
./start.sh
```

### **Method 2: Using Nodemon (Auto-restart)**
```bash
# Install nodemon globally (if not installed)
npm install -g nodemon

# Run with auto-restart
npm run dev
```

### **Method 3: Using Live Server (Frontend Only)**
If you want to test just the frontend:
```bash
# Install live-server globally
npm install -g live-server

# Run from the public directory
cd public
live-server --port=8080
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: CORS Errors**
**Error**: `Access to fetch at 'file:///api/process' from origin 'null' has been blocked by CORS policy`

**Solution**: 
- ✅ Use `http://localhost:3000` instead of opening the HTML file directly
- ❌ Don't double-click the HTML file

### **Issue 2: Port Already in Use**
**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm start
```

### **Issue 3: FFmpeg Not Found**
**Error**: `Cannot find module 'fluent-ffmpeg'`

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **Issue 4: Environment Variables Missing**
**Error**: `CLOUDINARY_CLOUD_NAME is not defined`

**Solution**:
```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your API keys
nano .env
```

## 🎯 **Development Workflow**

### **1. Start Development**
```bash
npm start
```

### **2. Access Application**
Open: http://localhost:3000

### **3. Make Changes**
- Edit files in `public/` for frontend changes
- Edit files in `services/` for backend changes
- Edit `server.js` for server configuration

### **4. Test Changes**
- Refresh browser to see frontend changes
- Restart server for backend changes: `Ctrl+C` then `npm start`

### **5. Commit Changes**
```bash
git add .
git commit -m "Your change description"
git push
```

## 🔍 **Debugging Tips**

### **Check Server Status**
```bash
# Check if server is running
curl http://localhost:3000/api/health

# Check server logs
npm start
```

### **Check Browser Console**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

### **Test API Endpoints**
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test file upload (replace with actual file)
curl -X POST -F "file=@test.mp3" http://localhost:3000/api/process
```

## 🚀 **Production vs Development**

### **Development (Local)**
- **URL**: http://localhost:3000
- **Purpose**: Testing and development
- **Features**: Auto-restart, detailed logs

### **Production (Deployed)**
- **URL**: https://your-app.railway.app (or similar)
- **Purpose**: Live application
- **Features**: Optimized, minimal logs

## 📝 **Environment Variables**

### **Required for Development**
```env
# Server configuration
PORT=3000
NODE_ENV=development

# Cloudinary (for cloud processing)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AssemblyAI (optional, for professional processing)
ASSEMBLYAI_API_KEY=your_assemblyai_key
```

### **Optional for Development**
```env
# Logging
LOG_LEVEL=debug

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🎉 **Quick Start Checklist**

- ✅ [ ] Run `npm install`
- ✅ [ ] Copy `env.example` to `.env`
- ✅ [ ] Add your API keys to `.env`
- ✅ [ ] Run `npm start`
- ✅ [ ] Open http://localhost:3000
- ✅ [ ] Test file upload
- ✅ [ ] Check browser console for errors

---

**🎯 Remember: Always use `http://localhost:3000` instead of opening the HTML file directly to avoid CORS errors!** 