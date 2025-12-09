import authService from '../services/auth.service.js';

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.register(email, password);
    res.status(201).json({ user: { email: user.email, id: user._id }, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    res.status(200).json({ user: { email: user.email, id: user._id }, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
