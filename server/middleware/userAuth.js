import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {
    // Extract the token from the request cookies
    const { token } = req.cookies;

    // Check if the token is present
    if (!token) {
        // Respond with an error message if no token is found
        return res.json({ success: false, message: 'Not Authorized! Login again' });
    }

    try {
        // Verify and decode the token using the secret key
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the decoded token contains a valid user ID
        if (tokenDecode.id) {
            // Attach the user ID from the token to the request body
            req.body.userId = tokenDecode.id;
        } else {
            // Respond with an error message if the token is invalid
            return res.json({ success: false, message: 'Not Authorized! Login again' });
        }

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Handle token verification errors and send an error message
        return res.json({ success: false, message: error.message });
    }
}

export default userAuth;