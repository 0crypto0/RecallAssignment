import { Router } from 'express';
import { getRecall } from '../controllers/recallController.js';

export const recallRouter = Router();

recallRouter.get('/', getRecall);
