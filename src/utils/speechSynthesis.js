/**
 * Speech synthesis utility for pronouncing English words
 * Uses the Web Speech API to provide natural pronunciation
 */

class SpeechSynthesisService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.isSupported = 'speechSynthesis' in window;
    this.isInitialized = false;
    
    if (this.isSupported) {
      this.initializeVoice();
    }
  }

  /**
   * Initialize and select the best English voice
   */
  initializeVoice() {
    const setVoice = () => {
      const voices = this.synth.getVoices();
      
      // Prefer US English voices
      const preferredVoices = [
        'Google US English', // Chrome
        'Microsoft Zira - English (United States)', // Edge
        'Alex', // Safari macOS
        'Samantha', // Safari macOS
        'Daniel', // Safari macOS
        'Karen', // Safari iOS
        'English United States' // Generic
      ];
      
      // Find preferred voice
      for (const preferredName of preferredVoices) {
        const voice = voices.find(v => v.name.includes(preferredName));
        if (voice) {
          this.voice = voice;
          this.isInitialized = true;
          return;
        }
      }
      
      // Fallback to any English voice
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en-') && voice.lang.includes('US')
      ) || voices.find(voice => 
        voice.lang.startsWith('en-')
      );
      
      if (englishVoice) {
        this.voice = englishVoice;
        this.isInitialized = true;
      } else {
        console.warn('No English voice found for speech synthesis');
      }
    };

    // Voices might not be loaded immediately
    if (this.synth.getVoices().length > 0) {
      setVoice();
    } else {
      this.synth.addEventListener('voiceschanged', setVoice);
    }
  }

  /**
   * Speak the given text
   * @param {string} text - Text to speak
   * @param {Object} options - Speech options
   * @returns {Promise} - Resolves when speech is complete
   */
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      if (!text || typeof text !== 'string') {
        reject(new Error('Invalid text provided'));
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice if available
      if (this.voice) {
        utterance.voice = this.voice;
      }
      
      // Set options
      utterance.rate = options.rate || 0.9; // Slightly slower for learning
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      utterance.lang = options.lang || 'en-US';

      // Event handlers
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));

      // Speak
      this.synth.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.isSupported) {
      this.synth.cancel();
    }
  }

  /**
   * Check if speech synthesis is supported and initialized
   */
  isReady() {
    return this.isSupported && this.isInitialized;
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.isSupported ? this.synth.getVoices() : [];
  }

  /**
   * Set a specific voice by name
   */
  setVoice(voiceName) {
    const voices = this.getVoices();
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      this.voice = voice;
      return true;
    }
    return false;
  }
}

// Create singleton instance
const speechService = new SpeechSynthesisService();

/**
 * Convenience function to speak English words
 * @param {string} word - English word to pronounce
 * @param {Object} options - Speech options
 */
export const speakWord = (word, options = {}) => {
  return speechService.speak(word, {
    rate: 0.8, // Slower for vocabulary learning
    ...options
  });
};

/**
 * Convenience function to speak English sentences
 * @param {string} sentence - English sentence to pronounce
 * @param {Object} options - Speech options
 */
export const speakSentence = (sentence, options = {}) => {
  return speechService.speak(sentence, {
    rate: 0.9,
    ...options
  });
};

/**
 * Stop any current speech
 */
export const stopSpeaking = () => {
  speechService.stop();
};

/**
 * Check if speech is supported
 */
export const isSpeechSupported = () => {
  return speechService.isSupported;
};

/**
 * Check if speech service is ready
 */
export const isSpeechReady = () => {
  return speechService.isReady();
};

export default speechService;