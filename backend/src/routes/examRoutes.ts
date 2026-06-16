import { Router } from 'express';
import { listResults } from '../controllers/examController';

export const examRoutes = Router();

examRoutes.get('/', listResults);
