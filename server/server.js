const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',   // agar keyinroq frontendni boshqa portga ko'chirsangiz
    'https://veding-henna.vercel.app'
  ],
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB ulandi'))
    .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token yo\'q' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Noto\'g\'ri token' });
    }
};

// Register
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashed });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Me
app.get('/api/me', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server Port:${PORT} da ishlamoqda`));