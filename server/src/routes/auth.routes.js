import express from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';

const router = express.Router();

// Uuden käyttäjän rekisteröinti
router.post('/register', register);

// Kirjautuminen
router.post('/login', login);

// Uloskirjautuminen
router.post('/logout', logout);

export default router;
