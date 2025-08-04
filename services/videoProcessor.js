const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const audioProcessor = require('./audioProcessor');

class VideoProcessor {
  async processVideo(inputPath, outputDir, enhancementLevel = 'medium', useFreeProcessing = false) {
    const startTime = Date.now();
    
    try {
      console.log('Processing video...');
      
      // Extract audio from video
      const audioPath = await this.extractAudio(inputPath, outputDir);
      
      // Process the extracted audio
      const audioResult = await audioProcessor.processAudio(
        audioPath, 
        outputDir, 
        enhancementLevel, 
        useFreeProcessing
      );
      
      // Recombine enhanced audio with original video
      const videoResult = await this.recombineVideoAudio(
        inputPath, 
        path.join(outputDir, audioResult.filename), 
        outputDir
      );
      
      // Clean up temporary audio files
      fs.removeSync(audioPath);
      fs.removeSync(path.join(outputDir, audioResult.filename));
      
      return {
        filename: videoResult.filename,
        size: videoResult.size,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('Video processing error:', error);
      throw new Error(`Video processing failed: ${error.message}`);
    }
  }

  async extractAudio(videoPath, outputDir) {
    const audioFilename = `temp-audio-${uuidv4()}.wav`;
    const audioPath = path.join(outputDir, audioFilename);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions([
          '-vn', // No video
          '-acodec', 'pcm_s16le', // PCM audio codec
          '-ar', '48000', // Sample rate
          '-ac', '2' // Stereo
        ])
        .output(audioPath)
        .on('end', () => {
          resolve(audioPath);
        })
        .on('error', (error) => {
          reject(error);
        })
        .run();
    });
  }

  async recombineVideoAudio(videoPath, audioPath, outputDir) {
    const outputFilename = `enhanced-video-${uuidv4()}.mp4`;
    const outputPath = path.join(outputDir, outputFilename);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v', 'copy', // Copy video stream without re-encoding
          '-c:a', 'aac', // Use AAC for audio
          '-b:a', '192k', // Audio bitrate
          '-map', '0:v:0', // Map video from first input
          '-map', '1:a:0' // Map audio from second input
        ])
        .output(outputPath)
        .on('end', async () => {
          try {
            const stats = await fs.stat(outputPath);
            resolve({
              filename: outputFilename,
              size: stats.size
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        })
        .run();
    });
  }

  // Alternative method for video-only processing (without audio extraction)
  async processVideoDirectly(inputPath, outputDir, enhancementLevel = 'medium') {
    const outputFilename = `enhanced-video-${uuidv4()}.mp4`;
    const outputPath = path.join(outputDir, outputFilename);

    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      // Apply video-specific enhancements
      command = this.applyVideoEnhancement(command, enhancementLevel);

      command
        .output(outputPath)
        .on('end', async () => {
          try {
            const stats = await fs.stat(outputPath);
            resolve({
              filename: outputFilename,
              size: stats.size
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        })
        .run();
    });
  }

  applyVideoEnhancement(command, enhancementLevel) {
    switch (enhancementLevel) {
      case 'low':
        return command
          .videoFilters([
            'unsharp=3:3:1.5:3:3:0.5', // Light sharpening
            'eq=contrast=1.1:brightness=0.05' // Slight contrast boost
          ])
          .audioFilters([
            'anlmdn=s=7:p=0.002:r=0.01', // Basic noise reduction
            'acompressor=threshold=0.1:ratio=2:attack=20:release=100' // Light compression
          ]);

      case 'high':
        return command
          .videoFilters([
            'unsharp=5:5:2:5:5:1', // Strong sharpening
            'eq=contrast=1.2:brightness=0.1:saturation=1.1', // Enhanced contrast and saturation
            'nlmeans=s=3:p=7:r=15', // Noise reduction
            'scale=trunc(iw/2)*2:trunc(ih/2)*2' // Ensure even dimensions
          ])
          .audioFilters([
            'anlmdn=s=7:p=0.0005:r=0.01', // Advanced noise reduction
            'aspectralgate=threshold=0.005:ratio=1:attack=0.05:release=0.05', // Spectral noise gate
            'acompressor=threshold=0.05:ratio=4:attack=5:release=25', // Multi-band compression
            'equalizer=f=60:width_type=o:width=2:g=-8', // Advanced EQ
            'equalizer=f=150:width_type=o:width=2:g=-4',
            'equalizer=f=400:width_type=o:width=2:g=-2',
            'equalizer=f=1000:width_type=o:width=2:g=-1',
            'equalizer=f=2500:width_type=o:width=2:g=2',
            'equalizer=f=5000:width_type=o:width=2:g=3',
            'equalizer=f=8000:width_type=o:width=2:g=2',
            'equalizer=f=12000:width_type=o:width=2:g=1',
            'highpass=f=150',
            'lowpass=f=10000',
            'alimiter=level_in=1:level_out=1:limit=0.8:attack=5:release=50'
          ]);

      default: // medium
        return command
          .videoFilters([
            'unsharp=4:4:1.8:4:4:0.8', // Medium sharpening
            'eq=contrast=1.15:brightness=0.08:saturation=1.05', // Balanced enhancement
            'nlmeans=s=2:p=5:r=10' // Moderate noise reduction
          ])
          .audioFilters([
            'anlmdn=s=7:p=0.001:r=0.01', // Enhanced noise reduction
            'aspectralgate=threshold=0.01:ratio=1:attack=0.1:release=0.1', // Spectral noise reduction
            'acompressor=threshold=0.08:ratio=3:attack=10:release=50', // Compression
            'equalizer=f=80:width_type=o:width=2:g=-6', // EQ for voice enhancement
            'equalizer=f=250:width_type=o:width=2:g=-3',
            'equalizer=f=1000:width_type=o:width=2:g=-2',
            'equalizer=f=3000:width_type=o:width=2:g=3',
            'equalizer=f=8000:width_type=o:width=2:g=2',
            'highpass=f=200',
            'lowpass=f=8000'
          ]);
    }
  }
}

module.exports = new VideoProcessor(); 