import { Router } from 'express';
import { getFeeStatement } from '../controllers/paymentController';

export const paymentRoutes = Router();

paymentRoutes.get('/statement', getFeeStatement);
