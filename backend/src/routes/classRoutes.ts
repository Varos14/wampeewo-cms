import { Router } from 'express';
import { listClasses } from '../controllers/classController';

export const classRoutes = Router();

classRoutes.get('/', listClasses);
