import { Router } from 'express';
import {
  checkGeminiAvailability,
  SupervisorAgent,
  loadUserContext,
} from '../agents/index.js';
import { compareProducts, recommendProduct } from '../agents/compare-agent.js';

export const aiRouter = Router();

const supervisorAgent = new SupervisorAgent();

aiRouter.get('/status', async (_req, res) => {
  const gemini = await checkGeminiAvailability();
  return res.status(gemini.available ? 200 : 503).json({ gemini });
});

aiRouter.post('/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  const userIdStr = req.cookies?.session_user_id;
  const userId = userIdStr ? parseInt(userIdStr, 10) : null;

  try {
    const userContext = await loadUserContext(userId);

    const response = await supervisorAgent.execute({
      message,
      userId,
      userContext,
      history: Array.isArray(history) ? history.slice(-8) : [],
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ message: 'Failed to process chat' });
  }
});

// Compare products — returns structured feature breakdown + follow-up questions
aiRouter.post('/compare', async (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products) || products.length < 2) {
    return res.status(400).json({ message: 'At least 2 products required' });
  }
  if (products.length > 3) {
    return res.status(400).json({ message: 'Maximum 3 products' });
  }
  try {
    const result = await compareProducts(products);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Compare Error:', error);
    return res.status(500).json({ message: 'Failed to compare products' });
  }
});

// Recommend best product based on user answers to follow-up questions
aiRouter.post('/recommend', async (req, res) => {
  const { products, userAnswers } = req.body;
  if (!Array.isArray(products) || products.length < 2) {
    return res.status(400).json({ message: 'Products required' });
  }
  if (!userAnswers) {
    return res.status(400).json({ message: 'User answers required' });
  }
  try {
    const result = await recommendProduct(products, userAnswers);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Recommend Error:', error);
    return res.status(500).json({ message: 'Failed to recommend product' });
  }
});
