import bcrypt from "bcrypt";
import ApiKey from "./models/ApiKey.js";

export const apiAuth = async (req, res, next) => {
    try {
        const apiKey = req.header("x-api-key");

        if (!apiKey) {
            return res.status(401).json({ error: "API key missing" });
        }

        const [keyId, keySecret] = apiKey.split(":");

        const storedKey = await ApiKey.findOne({ id: keyId });

        if (!storedKey) {
            return res.status(401).json({ error: "Invalid API key" });
        }

        const isValid = await bcrypt.compare(keySecret, storedKey.hashedKey);

        if (!isValid) {
            return res.status(401).json({ error: "Invalid API key" });
        }
        next;
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
