const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/tldr', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: 'Missing transcript' });
  }

  const systemPrompt = "You are a meeting summarizer. Return a markdown-formatted TLDR with bullet points and a guessed tone (positive, neutral, or negative).";
  const userPrompt = `Transcript: ${transcript}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
    });

    const content = completion.choices[0].message.content;

    // Extract tone if possible
    const toneMatch = content.match(/Tone:\s*(\w+)/i);
    const tone = toneMatch ? toneMatch[1] : 'Unknown';

    res.json({
      summary: content,
      tone,
    });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'Something went wrong with OpenAI.' });
  }
});

//  Fly.io requires your app to listen on port 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
