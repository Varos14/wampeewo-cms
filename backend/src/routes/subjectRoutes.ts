import { Router } from 'express';
import { listSubjects } from '../controllers/subjectController';

export const subjectRoutes = Router();

subjectRoutes.get('/', listSubjects);
