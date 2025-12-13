import User from 'models/user.model.js';
import Token from 'models/token.model.js';
import bcrypt from 'bcrypt';
import generateToken from 'utils/jwt.util.js';

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
        await Session.create({ user: user._id, token, expiresAt });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

const registerController = async (req, res) => {
    const { email, password } = req.body;

    if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    try {
        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }

}

export default { loginController, registerController };