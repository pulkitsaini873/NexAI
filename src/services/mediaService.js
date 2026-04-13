/**
 * TTS Service using NVIDIA magpie-tts and Web Speech API fallback.
 */

import { getApiKey } from './providerAdapter';
import { TTS_CONFIG } from '../config/models';

/**
 * Synthesize speech using NVIDIA TTS
 */
export async function synthesizeSpeech(text, voice = TTS_CONFIG.defaultVoice) {
  const apiKey = getApiKey('NVIDIA');
  
  if (!apiKey) {
    console.warn('NVIDIA API key not configured, falling back to Web Speech API');
    return synthesizeWithWebSpeech(text);
  }

  try {
    const response = await fetch(TTS_CONFIG.standardEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: TTS_CONFIG.model,
        input: text.slice(0, 4000), // Limit text length
        voice: voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      throw new Error(`NVIDIA TTS error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.warn('NVIDIA TTS failed, falling back to Web Speech API:', error);
    return synthesizeWithWebSpeech(text);
  }
}

/**
 * Fallback: use browser's Web Speech API
 */
export function synthesizeWithWebSpeech(text) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Return a special marker so we know it's Web Speech
    resolve({ webSpeech: true, utterance });
  });
}

/**
 * Play audio from a URL or Web Speech utterance
 */
export function playAudio(source) {
  if (source?.webSpeech) {
    window.speechSynthesis.speak(source.utterance);
    return {
      pause: () => window.speechSynthesis.pause(),
      resume: () => window.speechSynthesis.resume(),
      stop: () => window.speechSynthesis.cancel(),
    };
  }

  const audio = new Audio(source);
  audio.play();
  return {
    pause: () => audio.pause(),
    resume: () => audio.play(),
    stop: () => {
      audio.pause();
      audio.currentTime = 0;
    },
    audio,
  };
}

/**
 * Generate image using NVIDIA NIM
 */
export async function generateImage(prompt, aspectRatio = '1:1', modelId = 'stabilityai/stable-diffusion-xl') {
  const apiKey = getApiKey('NVIDIA');
  if (!apiKey) throw new Error('NVIDIA API key required for image generation');

  // Map aspect ratios to dimensions
  const dimensions = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1344, height: 768 },
    '9:16': { width: 768, height: 1344 },
  };

  const { width, height } = dimensions[aspectRatio] || dimensions['1:1'];

  const response = await fetch('https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      sampler: 'K_DPM_2_ANCESTRAL',
      seed: 0,
      steps: 25,
      width,
      height,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Image generation failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  
  if (data.artifacts?.[0]?.base64) {
    return `data:image/png;base64,${data.artifacts[0].base64}`;
  }
  
  throw new Error('No image data in response');
}
