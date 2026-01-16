import User from "../models/User.js";

const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user);
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden: Admins only' });
        }
    }catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

export default adminAuth;