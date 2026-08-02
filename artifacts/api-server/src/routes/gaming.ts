/**
 * gaming.ts — Gaming department routes.
 *
 * POST /gaming/build  → deterministic PC builder
 */

import { Router } from 'express';
import { buildGamingPc } from '../services/pc-builder.js';
import type { BuildBrief } from '../services/pc-builder.js';

export const gamingRouter = Router();

gamingRouter.post('/gaming/build', async (req, res): Promise<void> => {
  const body = req.body as Partial<BuildBrief>;

  if (!body.budget || typeof body.budget !== 'number' || body.budget <= 0) {
    res
      .status(400)
      .json({ message: 'budget (positive number in INR) is required' });
    return;
  }
  if (
    !body.workload ||
    !['gaming', 'streaming', 'creator', 'workstation'].includes(body.workload)
  ) {
    res
      .status(400)
      .json({
        message: 'workload must be gaming | streaming | creator | workstation',
      });
    return;
  }
  if (
    !body.targetDisplay ||
    !['1080p60', '1080p144', '1440p144', '4k60'].includes(body.targetDisplay)
  ) {
    res
      .status(400)
      .json({
        message: 'targetDisplay must be 1080p60 | 1080p144 | 1440p144 | 4k60',
      });
    return;
  }

  try {
    const brief: BuildBrief = {
      budget: body.budget,
      workload: body.workload,
      targetDisplay: body.targetDisplay,
      needsStreaming: body.needsStreaming ?? false,
      includePeripherals: body.includePeripherals ?? false,
      formFactor: body.formFactor,
      cpuBrand: body.cpuBrand ?? null,
      gpuBrand: body.gpuBrand ?? null,
    };

    const result = await buildGamingPc(brief);
    res.json(result);
  } catch (err) {
    console.error('Gaming build error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
