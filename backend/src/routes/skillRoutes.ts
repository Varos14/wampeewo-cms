import { Router } from 'express';

import { createSkill, listSkills } from '../controllers/skillController';

export const skillRoutes = Router();

skillRoutes.get('/', listSkills);
skillRoutes.post('/', createSkill);
