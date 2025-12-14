import jwt from 'jsonwebtoken';
import Token from '../models/Token.js';

const jwtAuth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : authHeader?.trim() || req.cookies.sessionToken;

        if (!token) return res.status(401).json({ error: "Token missing" });

        //Split token into UUID + JWT
        const [id, jwtToken] = token.split(':');
        if (!id || !jwtToken) return res.status(401).json({ error: "Invalid token format" });

        //Verify JWT
        try {
            await jwt.verify(jwtToken, process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({ error: "Invalid JWT" });
        }

        //Check token exists in DB
        const storedToken = await Token.findOne({ id, token: jwtToken });
        if (!storedToken) return res.status(401).json({ error: "Token not found in DB" });

        req.user = storedToken.user;
        next();
    } catch (err) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

export default jwtAuth;
