const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { chatWithModel } = require('./services/groqService');
const multer = require('multer');
const { textToSpeech, speechToText } = require('./services/groqService');

const upload = multer({ dest: 'uploads/' });

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { model, messages } = req.body;

  if (
    !model ||
    !messages ||
    !Array.isArray(messages) ||
    messages.length === 0
  ) {
    return res.status(400).json({
      error: 'Invalid request: model and non-empty messages array required.',
    });
  }

  try {
    console.log('🔁 Calling Groq with:', { model, messages });
    const response = await chatWithModel(model, messages);
    res.json(response);
  } catch (err) {
    console.error('❌ Groq API error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Groq API failed',
      details: err.response?.data || err.message,
    });
  }
});

app.post('/api/text-to-speech', async (req, res) => {
  const { text } = req.body;
  try {
    const audioBuffer = await textToSpeech(text);
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (err) {
    console.error('TTS error:', err.message);
    res.status(500).json({ error: 'TTS failed' });
  }
});

app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    const text = await speechToText(req.file.path);
    res.json({ text });
  } catch (err) {
    console.error('STT error:', err.message);
    res.status(500).json({ error: 'STT failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
