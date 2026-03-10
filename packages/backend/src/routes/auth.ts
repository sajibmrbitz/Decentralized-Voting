import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const admin = await prisma.admin.create({
            data: { username, passwordHash },
        });
        res.status(201).json({ id: admin.id, username: admin.username });
    } catch (error) {
        res.status(400).json({ error: 'Username already exists' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { username } });

    if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
        const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

export default router;
