// Importing required modules
import bcrypt from 'bcryptjs'; // For hashing and verifying passwords
import jwt from 'jsonwebtoken'; // For generating JSON Web Tokens
import userModel from '../models/userModel.js'; // Importing the user model for database interaction
import transporter from '../config/nodemailer.js'

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

        //Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Fight Club',
            text: `Welcome to Fight Club. Your account has been created with email id: ${email}`
        }

        await transporter.sendMail(mailOptions);

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

//Send Verification OTP to the User's email
export const sendVerifyOtp = async (req, res) => {
    try {
        // Extracting the userId from the request body
        const { userId } = req.body;

        // Fetching the user details from the database using the userId
        const user = await userModel.findById(userId);

        // Check if the account is already verified
        if (user.isAccountVerfied) {
            // Return a response if the account is already verified
            return res.json({ success: false, message: 'Account already verified' });
        }

        // Generate a 6-digit OTP as a string
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        // Store the OTP and set an expiry time for it (24 hours from now)
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

        // Save the updated user details in the database
        await user.save();

        // Define the email options for sending the OTP
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Fight Club - Account Verification OTP',
            text: `Your OTP is: ${otp}. Verify your account using this OTP.`
        }

        // Send the OTP email to the user
        await transporter.sendMail(mailOptions);

        // Respond with success after sending the email
        res.json({ success: true, message: 'Verification OTP sent on email' });
    } catch (error) {
        // Catch any errors and send a failure response with the error message
        return res.json({ success: false, message: error.message });
    }
}

// Function to handle email verification
export const verifyEmail = async (req, res) => {
    // Extracting userId and OTP from the request body
    const { userId, otp } = req.body;

    // Validate if userId and otp are provided
    if (!userId || !otp) {
        return res.json({ success: false, message: 'Missing Details' });
    }

    try {
        // Fetch the user record from the database using the provided userId
        const user = await userModel.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Validate the OTP: Ensure it matches the stored OTP and is not empty
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        // Check if the OTP has expired
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired' });
        }

        // Mark the user's account as verified
        user.isAccountVerfied = true;
        // Clear the OTP value to prevent reuse
        user.verifyOtp = '';
        // Reset the OTP expiration time
        user.verifyOtpExpireAt = 0;

        // Save the updated user record in the database
        await user.save();

        // Respond with a success message
        return res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        // Handle any unexpected errors and return an error message
        return res.json({ success: false, message: error.message })
    }
}