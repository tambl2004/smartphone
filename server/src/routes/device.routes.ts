import { Router } from 'express';
import { listDevices } from '../controllers/device.controller.js';

const router = Router();

router.get('/', listDevices);

export default router;