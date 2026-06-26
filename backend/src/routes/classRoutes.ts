import { Router } from 'express';
import { listClasses, createClass, updateClass, deleteClass } from '../controllers/classController';

export const classRoutes = Router();

classRoutes.get('/', listClasses);
classRoutes.post('/', createClass);
classRoutes.put('/:id', updateClass);
classRoutes.delete('/:id', deleteClass);
