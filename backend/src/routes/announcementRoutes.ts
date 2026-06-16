import { Router } from 'express';
import { listAnnouncements } from '../controllers/announcementController';

export const announcementRoutes = Router();

announcementRoutes.get('/', listAnnouncements);
