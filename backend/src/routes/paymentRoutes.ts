import { Router } from 'express';
import { getFeeStatement, getAllStatements } from '../controllers/paymentController';

export const paymentRoutes = Router();

paymentRoutes.get('/statement', getFeeStatement);
paymentRoutes.get('/statements', getAllStatements);
