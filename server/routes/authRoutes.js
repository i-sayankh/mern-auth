import express from 'express'
import { login, logout, register } from '../controllers/authController.js';

// Create a new router instance for handling authentication-related routes
const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

export default authRouter;