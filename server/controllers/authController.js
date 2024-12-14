// Importing required modules
import bcrypt from 'bcryptjs'; // For hashing and verifying passwords
import jwt from 'jsonwebtoken'; // For generating JSON Web Tokens
import userModel from '../models/userModel.js'; // Importing the user model for database interaction

// Register Controller Function
export const register = async (req, res) => {
    // Extracting user input from the request body
    const { name, email, password } = req.body;

    // Validating that all required fields are provided
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' });
    }

    try {
        // Check if a user with the given email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists!!!' });
        }

        // Hash the user's password with bcrypt for security
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance and save it to the database
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        // Generate a JWT token for the newly registered user
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Set a cookie with the generated token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Return a success response
        return res.json({ success: true });
    } catch (error) {
        // Handle errors and return an error response
        res.json({ success: false, message: error.message })
    }
}

// Login Controller Function
export const login = async (req, res) => {
    // Extracting user input from the request body
    const { email, password } = req.body;

    // Validating that both email and password are provided
    if (!email || !password) {
        return res.json({ success: false, message: 'Email & Password are required' });
    }

    try {
        // Check if a user with the given email exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invalid email' });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid Password' });
        }

        // Generate a JWT token for the authenticated user
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Set a cookie with the generated token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Return a success response
        return res.json({ success: true });
    } catch (error) {
        // Handle errors and return an error response
        return res.json({ success: false, message: error.message });
    }
}

//Logout Controller Function
export const logout = async (req, res) => {
    try {
        // Clear the 'token' cookie to effectively log out the user
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        // Send a response indicating successful logout
        return res.json({ success: true, message: 'Logged Out' });
    } catch (error) {
        // Handle errors and send an appropriate response
        return res.json({ success: false, message: error.message });
    }
}