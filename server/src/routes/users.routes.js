import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { deleteAccount, getProfile, updateProfile, changePassword } from '../controllers/users.controller.js';
// Groups & Favorites (Jere Puirava's module)
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favorites.controller.js';

const router = express.Router();

// Kaikki tämän tiedoston reitit vaativat kirjautumisen
router.use(authenticateToken);

// Hae kirjautuneen käyttäjän profiili
router.get('/me', getProfile);

// Päivitä kirjautuneen käyttäjän tiedot (esim. email)
router.put('/me', updateProfile);

// Vaihda käyttäjän salasana
router.put('/me/password', changePassword);

// Poista käyttäjätili kokonaan poistaa myös siihen liittyvät datat
router.delete('/me', deleteAccount);

// Lisää elokuva suosikkeihin
router.post('/me/favorites', addFavorite);

// Hae käyttäjän suosikkielokuvat
router.get('/me/favorites', getFavorites);

// Poista elokuva suosikeista
router.delete('/me/favorites/:movieId', removeFavorite);

export default router;
