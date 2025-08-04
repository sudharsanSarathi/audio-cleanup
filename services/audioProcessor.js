const AssemblyAI = require('assemblyai');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

class AudioProcessor {
  constructor() {
    // Initialize AssemblyAI client if API key is available
    this.assemblyai = process.env.ASSEMBLYAI_API_KEY 
      ? new AssemblyAI(process.env.ASSEMBLYAI_API_KEY)
      : null;
  }

  async processAudio(inputPath, outputDir, enhancementLevel = 'medium', useFreeProcessing = false) {
    const startTime = Date.now();
    
    try {
      if (useFreeProcessing || !this.assemblyai) {
        return await this.processWithFFmpeg(inputPath, outputDir, enhancementLevel);
      } else {
        return await this.processWithAssemblyAI(inputPath, outputDir, enhancementLevel);
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      throw new Error(`Audio processing failed: ${error.message}`);
    } finally {
      const processingTime = Date.now() - startTime;
      console.log(`Audio processing completed in ${processingTime}ms`);
    }
  }

  async processWithAssemblyAI(inputPath, outputDir, enhancementLevel) {
    if (!this.assemblyai) {
      throw new Error('AssemblyAI API key not configured');
    }

    console.log('Processing audio with AssemblyAI...');

    // Upload file to AssemblyAI
    const upload = await this.assemblyai.files.upload(inputPath);
    
    // Configure transcription with noise reduction
    const transcript = await this.assemblyai.transcripts.create({
      audio_url: upload.url,
      speech_model: 'best',
      auto_highlights: false,
      auto_chapters: false,
      entity_detection: false,
      sentiment_analysis: false,
      auto_highlights_result: false,
      auto_chapters_result: false,
      entity_detection_result: false,
      sentiment_analysis_result: false,
      // Audio enhancement settings
      audio_start_from: 0,
      audio_end_at: null,
      boost_param: enhancementLevel === 'high' ? 'high' : 'standard',
      filter_profanity: false,
      disfluencies: false,
      punctuate: true,
      format_text: true,
      language_code: 'en'
    });

    // Wait for processing to complete
    let transcriptResult;
    while (true) {
      transcriptResult = await this.assemblyai.transcripts.get(transcript.id);
      if (transcriptResult.status === 'completed') {
        break;
      } else if (transcriptResult.status === 'error') {
        throw new Error('AssemblyAI processing failed');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Download the enhanced audio
    const outputFilename = `enhanced-${uuidv4()}.wav`;
    const outputPath = path.join(outputDir, outputFilename);

    // Note: AssemblyAI doesn't directly provide enhanced audio download
    // We'll use their transcription to create a cleaned version with FFmpeg
    // For production, you might want to use their audio enhancement API directly
    
    // For now, we'll use FFmpeg with enhanced settings
    return await this.processWithFFmpeg(inputPath, outputDir, enhancementLevel);
  }

  async processWithFFmpeg(inputPath, outputDir, enhancementLevel) {
    console.log('Processing audio with FFmpeg...');

    const outputFilename = `enhanced-${uuidv4()}.wav`;
    const outputPath = path.join(outputDir, outputFilename);

    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      // Apply noise reduction and enhancement based on level
      switch (enhancementLevel) {
        case 'low':
          command = this.applyLowEnhancement(command);
          break;
        case 'high':
          command = this.applyHighEnhancement(command);
          break;
        default: // medium
          command = this.applyMediumEnhancement(command);
      }

      command
        .output(outputPath)
        .on('end', async () => {
          try {
            const stats = await fs.stat(outputPath);
            resolve({
              filename: outputFilename,
              size: stats.size,
              processingTime: Date.now() - Date.now()
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

  applyLowEnhancement(command) {
    return command
      .audioFilters([
        // Basic noise reduction
        'anlmdn=s=7:p=0.002:r=0.01',
        // Light compression
        'acompressor=threshold=0.1:ratio=2:attack=20:release=100',
        // Basic EQ
        'equalizer=f=1000:width_type=o:width=2:g=-3',
        'equalizer=f=3000:width_type=o:width=2:g=2'
      ])
      .audioCodec('pcm_s16le')
      .audioFrequency(44100);
  }

  applyMediumEnhancement(command) {
    return command
      .audioFilters([
        // Enhanced noise reduction
        'anlmdn=s=7:p=0.001:r=0.01',
        // Spectral noise reduction
        'aspectralgate=threshold=0.01:ratio=1:attack=0.1:release=0.1',
        // Compression
        'acompressor=threshold=0.08:ratio=3:attack=10:release=50',
        // EQ for voice enhancement
        'equalizer=f=80:width_type=o:width=2:g=-6',
        'equalizer=f=250:width_type=o:width=2:g=-3',
        'equalizer=f=1000:width_type=o:width=2:g=-2',
        'equalizer=f=3000:width_type=o:width=2:g=3',
        'equalizer=f=8000:width_type=o:width=2:g=2',
        // De-essing
        'highpass=f=200',
        'lowpass=f=8000'
      ])
      .audioCodec('pcm_s16le')
      .audioFrequency(48000);
  }

  applyHighEnhancement(command) {
    return command
      .audioFilters([
        // Advanced noise reduction
        'anlmdn=s=7:p=0.0005:r=0.01',
        // Spectral noise gate
        'aspectralgate=threshold=0.005:ratio=1:attack=0.05:release=0.05',
        // Multi-band compression
        'acompressor=threshold=0.05:ratio=4:attack=5:release=25',
        // Advanced EQ
        'equalizer=f=60:width_type=o:width=2:g=-8',
        'equalizer=f=150:width_type=o:width=2:g=-4',
        'equalizer=f=400:width_type=o:width=2:g=-2',
        'equalizer=f=1000:width_type=o:width=2:g=-1',
        'equalizer=f=2500:width_type=o:width=2:g=2',
        'equalizer=f=5000:width_type=o:width=2:g=3',
        'equalizer=f=8000:width_type=o:width=2:g=2',
        'equalizer=f=12000:width_type=o:width=2:g=1',
        // De-essing and filtering
        'highpass=f=150',
        'lowpass=f=10000',
        // Limiter
        'alimiter=level_in=1:level_out=1:limit=0.8:attack=5:release=50'
      ])
      .audioCodec('pcm_s16le')
      .audioFrequency(48000);
  }
}

module.exports = new AudioProcessor(); 