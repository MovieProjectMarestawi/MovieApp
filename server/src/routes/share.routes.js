import express from 'express';
import { getShareableFavorites } from '../controllers/share.controller.js';

const router = express.Router();

// Hae käyttäjän jaettavat suosikit (julkinen linkki)
router.get('/share/:userId', getShareableFavorites);

export default router;
