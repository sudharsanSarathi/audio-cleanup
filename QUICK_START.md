# 🚀 Quick Start Guide - AudioClean Pro

## ⚡ Get Started in 5 Minutes

### 1. **Prerequisites**
- Node.js (v14 or higher) ✅
- FFmpeg (automatically installed via npm) ✅

### 2. **Installation**
```bash
# Clone or download the project
cd "Audio noce cleanup"

# Install dependencies
npm install

# Create environment file
cp env.example .env
```

### 3. **Start the Application**
```bash
# Option 1: Use the start script
./start.sh

# Option 2: Manual start
npm start
```

### 4. **Access the Application**
Open your browser and go to: **http://localhost:3000**

## 🎯 What You Get

### ✅ **Ready to Use Features**
- **File Upload**: Drag & drop or click to browse
- **Multiple Formats**: MP3, WAV, MP4, AVI, MOV, WMV, FLV
- **Processing Options**: 
  - Low, Medium, High enhancement levels
  - Professional (AssemblyAI) or Free (FFmpeg) processing
- **Real-time Progress**: Live tracking of processing status
- **Secure Download**: Automatic file cleanup after download
- **Responsive Design**: Works on desktop, tablet, and mobile

### 🆓 **Free Processing (FFmpeg)**
- **Cost**: $0
- **Quality**: Good for basic enhancement
- **Features**: Noise reduction, EQ, compression
- **Speed**: Fast local processing

### 💎 **Professional Processing (AssemblyAI)**
- **Cost**: $0.25/hour (3 hours free/month)
- **Quality**: Excellent AI-powered enhancement
- **Features**: Advanced noise removal, speech enhancement
- **Speed**: Cloud-based processing

## 🔧 Configuration

### **Optional: Add AssemblyAI API Key**
1. Sign up at [AssemblyAI](https://www.assemblyai.com/)
2. Get your free API key
3. Edit `.env` file:
   ```env
   ASSEMBLYAI_API_KEY=your_api_key_here
   ```

### **File Size Limits**
- **Maximum**: 100MB per file
- **Supported Formats**: Audio and video files
- **Processing Time**: 30 seconds to 5 minutes (depending on file size)

## 📱 Usage

### **Step 1: Upload File**
- Drag and drop your audio/video file
- Or click "Browse Files" to select

### **Step 2: Choose Settings**
- **Enhancement Level**: Low, Medium, High
- **Processing Mode**: Professional or Free

### **Step 3: Process**
- Click "Start Processing"
- Watch real-time progress
- Wait for completion

### **Step 4: Download**
- Click "Download Enhanced File"
- File is automatically cleaned up after download

## 🎛️ Processing Options

### **Enhancement Levels**

#### **Low Enhancement**
- Basic noise reduction
- Light compression
- Fastest processing
- Good for quick fixes

#### **Medium Enhancement** (Recommended)
- Enhanced noise reduction
- Voice-optimized EQ
- Balanced quality/speed
- Best for most use cases

#### **High Enhancement**
- Advanced noise reduction
- Multi-band compression
- Maximum quality
- Best for professional use

### **Processing Modes**

#### **Free (FFmpeg)**
- ✅ No cost
- ✅ Works offline
- ✅ Fast processing
- ❌ Lower quality than AI

#### **Professional (AssemblyAI)**
- ✅ Best quality
- ✅ AI-powered
- ✅ Advanced features
- ❌ Requires API key
- ❌ Internet connection needed

## 🔒 Security & Privacy

### **Built-in Security**
- **Rate Limiting**: 10 requests per 15 minutes per IP
- **File Validation**: Only audio/video files allowed
- **Size Limits**: 100MB maximum
- **Automatic Cleanup**: Files deleted after processing
- **No Storage**: Files never stored permanently

### **Privacy Features**
- Files processed locally (FFmpeg) or securely (AssemblyAI)
- No permanent storage of user files
- Automatic cleanup after download
- No user tracking or analytics

## 🚀 Deployment Options

### **Local Development**
```bash
npm run dev  # Auto-restart on changes
```

### **Production Deployment**
```bash
# Heroku
heroku create your-app-name
git push heroku main

# VPS/Cloud
npm install -g pm2
pm2 start server.js --name "audioclean"
```

### **Docker**
```bash
docker build -t audioclean .
docker run -p 3000:3000 audioclean
```

## 🐛 Troubleshooting

### **Common Issues**

1. **"FFmpeg not found"**
   - ✅ Already handled by @ffmpeg-installer/ffmpeg

2. **"File upload fails"**
   - Check file size (max 100MB)
   - Verify file type is supported
   - Ensure upload directory has write permissions

3. **"Processing fails"**
   - Check server logs
   - Verify sufficient disk space
   - Restart the application

4. **"AssemblyAI errors"**
   - Verify API key is correct
   - Check internet connection
   - Use free processing as fallback

### **Logs**
```bash
# View application logs
npm start

# Check for errors in browser console
# Press F12 in your browser
```

## 📊 Performance

### **Processing Times**
- **Small files (< 10MB)**: 10-30 seconds
- **Medium files (10-50MB)**: 30 seconds - 2 minutes
- **Large files (50-100MB)**: 2-5 minutes

### **Quality Comparison**
- **FFmpeg**: Good for basic enhancement
- **AssemblyAI**: Excellent for professional use
- **File size**: Usually increases due to higher quality

## 🎉 Success!

Your AudioClean Pro micro SaaS is now ready to use! 

### **Next Steps**
1. Test with different file types
2. Customize the interface (edit `public/styles.css`)
3. Add your own branding
4. Deploy to production
5. Start monetizing!

### **Monetization Ideas**
- **Freemium**: Free FFmpeg, paid AssemblyAI
- **Usage-based**: Pay per minute processed
- **Subscription**: Monthly/yearly plans
- **API Access**: Charge for API usage

---

**🎵 Happy Audio Processing!** 