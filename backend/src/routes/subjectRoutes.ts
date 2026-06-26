import { Router } from 'express';
import { listSubjects, createSubject, updateSubject, deleteSubject } from '../controllers/subjectController';

export const subjectRoutes = Router();

subjectRoutes.get('/', listSubjects);
subjectRoutes.post('/', createSubject);
subjectRoutes.put('/:id', updateSubject);
subjectRoutes.delete('/:id', deleteSubject);
