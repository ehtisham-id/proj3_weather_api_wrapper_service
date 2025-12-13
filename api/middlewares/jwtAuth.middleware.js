import bcrypt from 'bcrypt';
import Token from 'models/Token.js';

export const jwtAuth = async (req, res, next) => {
    try {
        const jwtToken = req.header("Authorization");

        if (!jwtToken) {
            return res.status(401).json({ error: "API key missing" });
        }

        const token = jwtToken.startsWith('Bearer ')
            ? jwtToken.slice(7).trim()
            : jwtToken.trim();

        const [id, tokenSecret] = token.split(":");

        const storedToken = await Token.findOne({ id });

        if (!storedToken) {
            return res.status(401).json({ error: "Invalid API key" });
        }

        const decoded = await jwt.verify(tokenSecret, process.env.JWT_SECRET);

        if(!decoded || decoded.id !== id) {
            return res.status(401).json({ error: "Invalid API key" });
        }
        next;
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
