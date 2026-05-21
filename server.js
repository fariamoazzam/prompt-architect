require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Route 1: Analyze the user's goal and find missing context gaps
app.post('/api/analyze', async (req, res) => {
  const { goal, model, format, complexity } = req.body;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: `You are a prompt engineering expert. A user has described a project or task they want to accomplish using an AI model. Your job is to identify 3-5 critical missing pieces of context that would significantly improve a prompt for this task. For each gap, provide a short question to ask the user, and a one-line explanation of why it matters. Respond ONLY with a JSON array like: [{"question":"...","why":"..."}]. No preamble, no markdown fences.`,
      messages: [{
        role: 'user',
        content: `Goal: ${goal}\nModel: ${model}\nOutput format: ${format}\nComplexity: ${complexity}`
      }]
    });

    const text = response.content[0].text.replace(/```json|```/g, '').trim();
    const gaps = JSON.parse(text);
    res.json({ gaps });
  } catch (err) {
    console.error('Analyze error:', err.message);
    res.status(500).json({ error: 'Failed to analyze. Check your API key.' });
  }
});

// Route 2: Build the final XML-structured prompt
app.post('/api/build', async (req, res) => {
  const { goal, model, format, gapAnswers } = req.body;

  const gapContext = gapAnswers
    .filter(g => g.answer.trim())
    .map(g => `Q: ${g.question}\nA: ${g.answer}`)
    .join('\n\n');

  const unanswered = gapAnswers
    .filter(g => !g.answer.trim())
    .map(g => g.question);

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: `You are a world-class prompt engineer. Generate a complete, production-ready prompt using XML tags — the best format for LLMs, especially Claude. The prompt must include these XML sections: <role>, <context>, <project_knowledge>, <task>, <constraints>, <output_format>, and <examples>. Fill in everything the user has provided. For anything still missing, write [PLACEHOLDER: description of what goes here]. Output ONLY the raw XML prompt — no explanation, no markdown fences.`,
      messages: [{
        role: 'user',
        content: `Goal: ${goal}\nTarget model: ${model}\nOutput format: ${format}\n\nContext provided:\n${gapContext || 'None'}\n\nUnanswered gaps:\n${unanswered.join('\n') || 'None'}`
      }]
    });

    const prompt = response.content[0].text.trim();
    res.json({ prompt });
  } catch (err) {
    console.error('Build error:', err.message);
    res.status(500).json({ error: 'Failed to build prompt. Check your API key.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Prompt Architect running at http://localhost:${PORT}`);
});
