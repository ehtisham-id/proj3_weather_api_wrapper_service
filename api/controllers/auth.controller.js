import User from '../models/User.js';
import Token from '../models/Token.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/jwt.util.js';
import sendEmail from '../services/email.service.js';

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = generateToken({ id: user._id, email: user.email });
        const [id, secretToken] = token.split(":");
        const userToken = new Token({ id, user, token: secretToken });

        await userToken.save();

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        res.cookie("sessionToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: expiresAt
        });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

const registerController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ email, password });
        await newUser.save();
        //This line will be changed later to send a verification email
        sendEmail();
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }

}

export default { loginController, registerController };