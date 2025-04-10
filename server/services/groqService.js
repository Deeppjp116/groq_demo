const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const groqApi = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

const chatWithModel = async (model, messages) => {
  const response = await groqApi.post(
    '/chat/completions',
    {
      model,
      messages,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
    }
  );
  return response.data;
};

async function textToSpeech(text) {
  const response = await axios.post(
    'https://api.groq.com/v1/audio/speech',
    {
      model: 'groq-tts-1',
      voice: 'en-GB-Male-1', // or any other available Groq voice
      input: text,
    },
    {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
    }
  );

  return response.data; // this is audio buffer
}

// 🎙️ Speech-to-Text
async function speechToText(audioFilePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(audioFilePath));
  form.append('model', 'whisper-large-v3'); // Groq’s STT model

  const response = await axios.post(
    'https://api.groq.com/v1/audio/transcriptions',
    form,
    {
      headers: {
        ...headers,
        ...form.getHeaders(),
      },
    }
  );

  return response.data.text;
}

module.exports = { chatWithModel, textToSpeech, speechToText };
