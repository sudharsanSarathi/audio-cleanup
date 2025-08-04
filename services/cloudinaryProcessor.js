const cloudinary = require('cloudinary').v2;
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class CloudinaryProcessor {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  async processAudio(inputPath, outputDir, enhancementLevel = 'medium') {
    const startTime = Date.now();
    
    try {
      console.log('Processing audio with Cloudinary...');
      
      // Upload file to Cloudinary
      const uploadResult = await this.uploadToCloudinary(inputPath, 'audio');
      
      // Apply audio transformations based on enhancement level
      const transformations = this.getAudioTransformations(enhancementLevel);
      
      // Generate enhanced audio URL
      const enhancedUrl = cloudinary.url(uploadResult.public_id, {
        resource_type: 'video',
        transformation: transformations,
        format: 'wav'
      });
      
      // Download the enhanced file
      const outputFilename = `enhanced-${uuidv4()}.wav`;
      const outputPath = path.join(outputDir, outputFilename);
      
      await this.downloadFromUrl(enhancedUrl, outputPath);
      
      // Clean up uploaded file from Cloudinary
      await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: 'video' });
      
      const stats = await fs.stat(outputPath);
      
      return {
        filename: outputFilename,
        size: stats.size,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('Cloudinary processing error:', error);
      throw new Error(`Cloudinary processing failed: ${error.message}`);
    }
  }

  async processVideo(inputPath, outputDir, enhancementLevel = 'medium') {
    const startTime = Date.now();
    
    try {
      console.log('Processing video with Cloudinary...');
      
      // Upload file to Cloudinary
      const uploadResult = await this.uploadToCloudinary(inputPath, 'video');
      
      // Apply video transformations based on enhancement level
      const transformations = this.getVideoTransformations(enhancementLevel);
      
      // Generate enhanced video URL
      const enhancedUrl = cloudinary.url(uploadResult.public_id, {
        resource_type: 'video',
        transformation: transformations,
        format: 'mp4'
      });
      
      // Download the enhanced file
      const outputFilename = `enhanced-video-${uuidv4()}.mp4`;
      const outputPath = path.join(outputDir, outputFilename);
      
      await this.downloadFromUrl(enhancedUrl, outputPath);
      
      // Clean up uploaded file from Cloudinary
      await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: 'video' });
      
      const stats = await fs.stat(outputPath);
      
      return {
        filename: outputFilename,
        size: stats.size,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('Cloudinary processing error:', error);
      throw new Error(`Cloudinary processing failed: ${error.message}`);
    }
  }

  async uploadToCloudinary(filePath, resourceType) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(filePath, {
        resource_type: resourceType,
        folder: 'audioclean-pro',
        use_filename: true,
        unique_filename: true
      }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  async downloadFromUrl(url, outputPath) {
    const https = require('https');
    const fs = require('fs');
    
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(outputPath, () => {}); // Delete the file if download fails
        reject(err);
      });
    });
  }

  getAudioTransformations(enhancementLevel) {
    switch (enhancementLevel) {
      case 'low':
        return [
          { audio_codec: 'aac', audio_bitrate: '128k' },
          { audio_frequency: 44100 }
        ];
      
      case 'high':
        return [
          { audio_codec: 'aac', audio_bitrate: '320k' },
          { audio_frequency: 48000 },
          { audio_effects: 'volume:1.2' }
        ];
      
      default: // medium
        return [
          { audio_codec: 'aac', audio_bitrate: '192k' },
          { audio_frequency: 48000 }
        ];
    }
  }

  getVideoTransformations(enhancementLevel) {
    switch (enhancementLevel) {
      case 'low':
        return [
          { video_codec: 'auto', audio_codec: 'aac' },
          { quality: 'auto:low' }
        ];
      
      case 'high':
        return [
          { video_codec: 'auto', audio_codec: 'aac' },
          { quality: 'auto:high' },
          { audio_bitrate: '192k' }
        ];
      
      default: // medium
        return [
          { video_codec: 'auto', audio_codec: 'aac' },
          { quality: 'auto:medium' },
          { audio_bitrate: '128k' }
        ];
    }
  }
}

module.exports = new CloudinaryProcessor(); 