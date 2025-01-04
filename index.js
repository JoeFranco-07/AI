const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;
const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

let conversationContext = '';

app.use(express.static('public'));
app.use(express.json());

app.post('/ask', async (req, res) => {
  const userMessage = req.body.message;

  conversationContext += `\nUser: ${userMessage.replace(/\*/g, '')}`;

  try {
    const result = await model.generateContent(conversationContext);
    const aiResponse = result.response.text().replace(/[*`]/g, '');
    conversationContext += `\nAI: ${aiResponse}`;
    
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error generating content:', error);

    if (error.message.includes('SAFETY')) {
      return res.status(500).json({ error: 'An error occurred', reset: true });
    }

    res.status(500).json({ error: 'An error occurred' });
  }
});
//Restart the conversation(Offensive Words);
app.post('/reset', (req, res) => {
  conversationContext = '';  
  res.sendStatus(200);
  
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


