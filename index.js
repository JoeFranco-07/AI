const express = require('express');
const session = require('express-session');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;
const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 5 * 60 * 1000 // Sessions expire after 5 minutes
  },
}));

app.use(express.static('public'));
app.use(express.json());

// Clear session on every page load
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    req.session.destroy(err => {
      if (err) {
        console.error('Error clearing session:', err);
      }
    });
  }
  next();
});

app.post('/ask', async (req, res) => {
  if (!req.session.conversationContext) {
    req.session.conversationContext = '';
  }

  const userMessage = req.body.message;

  req.session.conversationContext += `\nUser: ${userMessage.replace(/\*/g, '')}`;

  try {
    const result = await model.generateContent(req.session.conversationContext);
    const aiResponse = result.response.text().replace(/[*`]/g, '');
    req.session.conversationContext += `\nAI: ${aiResponse}`;

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error generating content:', error);

    if (error.message.includes('SAFETY')) {
      return res.status(500).json({ error: 'An error occurred', reset: true });
    }

    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/reset', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error resetting session:', err);
      return res.status(500).json({ error: 'Failed to reset session' });
    }
    res.sendStatus(200);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
