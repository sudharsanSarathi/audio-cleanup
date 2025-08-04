# AudioClean Pro - Audio & Video Noise Removal SaaS

A professional micro SaaS application for removing noise and enhancing audio/video quality using AI-powered processing.

## 🚀 Features

- **AI-Powered Enhancement**: Uses AssemblyAI for professional-grade audio processing
- **Free Processing Option**: FFmpeg-based processing for cost-effective solutions
- **Multi-Format Support**: Handles MP3, WAV, MP4, AVI, MOV, WMV, FLV files
- **Real-time Processing**: Live progress tracking and status updates
- **Secure & Private**: Automatic file cleanup after processing
- **Responsive Design**: Beautiful, mobile-friendly interface
- **Rate Limiting**: Built-in protection against abuse

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Audio Processing**: AssemblyAI API, FFmpeg
- **Video Processing**: FFmpeg with custom filters
- **Security**: Helmet, CORS, Rate Limiting
- **File Handling**: Multer, fs-extra

## 📋 Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system
- AssemblyAI API key (optional, for professional processing)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd audio-noise-cleanup-saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install FFmpeg**
   
   **macOS (using Homebrew):**
   ```bash
   brew install ffmpeg
   ```
   
   **Ubuntu/Debian:**
   ```bash
   sudo apt update
   sudo apt install ffmpeg
   ```
   
   **Windows:**
   Download from [FFmpeg official website](https://ffmpeg.org/download.html)

4. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file and add your API keys:
   ```env
   PORT=3000
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
   ```

5. **Start the application**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 🔑 API Keys Setup

### AssemblyAI (Recommended)
1. Sign up at [AssemblyAI](https://www.assemblyai.com/)
2. Get your free API key from the dashboard
3. Add it to your `.env` file

### Free Processing (FFmpeg)
- No API key required
- Uses local FFmpeg installation
- Good quality for basic noise removal

## 📖 Usage

### Web Interface
1. **Upload File**: Drag and drop or click to browse
2. **Choose Settings**:
   - Enhancement Level: Low, Medium, High
   - Processing Mode: Professional (AssemblyAI) or Free (FFmpeg)
3. **Process**: Click "Start Processing"
4. **Download**: Get your enhanced file

### API Endpoints

#### Process Audio/Video
```http
POST /api/process
Content-Type: multipart/form-data

Parameters:
- file: Audio/video file (max 100MB)
- enhancementLevel: "low" | "medium" | "high"
- useFreeProcessing: "true" | "false"
```

**Response:**
```json
{
  "success": true,
  "message": "File processed successfully",
  "downloadUrl": "/api/download/enhanced-file.wav",
  "filename": "enhanced-file.wav",
  "processingTime": 5000,
  "originalSize": 1048576,
  "processedSize": 2097152
}
```

#### Download Processed File
```http
GET /api/download/{filename}
```

#### Health Check
```http
GET /api/health
```

## 🎛️ Processing Options

### Enhancement Levels

#### Low Enhancement
- Basic noise reduction
- Light compression
- Minimal EQ adjustments
- Fastest processing

#### Medium Enhancement (Default)
- Enhanced noise reduction
- Spectral noise gate
- Voice-optimized EQ
- Balanced quality/speed

#### High Enhancement
- Advanced noise reduction
- Multi-band compression
- Comprehensive EQ
- Maximum quality

### Processing Modes

#### Professional (AssemblyAI)
- **Pros**: Best quality, AI-powered
- **Cons**: API costs, requires internet
- **Best for**: Production use, high-quality requirements

#### Free (FFmpeg)
- **Pros**: No costs, works offline
- **Cons**: Lower quality than AI
- **Best for**: Testing, basic enhancement

## 🔒 Security Features

- **Rate Limiting**: 10 requests per 15 minutes per IP
- **File Type Validation**: Only audio/video files allowed
- **File Size Limits**: 100MB maximum
- **Automatic Cleanup**: Files deleted after processing
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: HTTP headers protection

## 📁 Project Structure

```
audio-noise-cleanup-saas/
├── server.js                 # Main Express server
├── package.json             # Dependencies and scripts
├── env.example              # Environment variables template
├── README.md               # This file
├── services/
│   ├── audioProcessor.js   # Audio processing logic
│   └── videoProcessor.js   # Video processing logic
├── public/
│   ├── index.html          # Main web interface
│   ├── styles.css          # Styling
│   └── script.js           # Frontend JavaScript
├── uploads/                # Temporary upload directory
└── processed/              # Temporary processed files
```

## 🚀 Deployment

### Heroku
1. Create a Heroku app
2. Add FFmpeg buildpack:
   ```bash
   heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
   ```
3. Set environment variables
4. Deploy

### Docker
```dockerfile
FROM node:16-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### VPS/Cloud
1. Install Node.js and FFmpeg
2. Clone repository
3. Set up environment variables
4. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "audioclean"
   ```

## 💰 Pricing & Costs

### AssemblyAI Costs
- **Free Tier**: 3 hours of audio processing per month
- **Paid**: $0.25 per hour of audio
- **Video**: Audio portion only (video processing is free)

### Free Processing
- **Cost**: $0
- **Quality**: Good for basic enhancement
- **Limitations**: No AI-powered features

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `ASSEMBLYAI_API_KEY` | AssemblyAI API key | - |
| `NODE_ENV` | Environment mode | development |

### Rate Limiting
```javascript
// In server.js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // 10 requests per window
});
```

### File Upload Limits
```javascript
// In server.js
const upload = multer({
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});
```

## 🐛 Troubleshooting

### Common Issues

1. **FFmpeg not found**
   ```bash
   # Check if FFmpeg is installed
   ffmpeg -version
   ```

2. **AssemblyAI API errors**
   - Verify API key is correct
   - Check API quota/limits
   - Ensure internet connection

3. **File upload fails**
   - Check file size (max 100MB)
   - Verify file type is supported
   - Ensure upload directory has write permissions

4. **Processing fails**
   - Check server logs
   - Verify FFmpeg installation
   - Ensure sufficient disk space

### Logs
Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [AssemblyAI](https://www.assemblyai.com/) for professional audio processing
- [FFmpeg](https://ffmpeg.org/) for free audio/video processing
- [Express.js](https://expressjs.com/) for the web framework
- [Font Awesome](https://fontawesome.com/) for icons

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Made with ❤️ for audio enthusiasts and content creators** 