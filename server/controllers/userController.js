import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User Not Found!!!' });
        }

        return res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerfied: user.isAccountVerfied,
            }
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}