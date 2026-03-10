import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/authMiddleware';
import multer from 'multer';
import { uploadToIPFS } from '../services/ipfsService';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-image', authMiddleware, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const ipfsHash = await uploadToIPFS(req.file.path);
        // Clean up local file
        fs.unlinkSync(req.file.path);
        res.json({ ipfsHash });
    } catch (error) {
        res.status(500).json({ message: 'IPFS upload failed' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const { electionId, name, ipfsHash } = req.body;
    try {
        const candidate = await prisma.candidate.create({
            data: { electionId, name, ipfsHash },
        });
        res.status(201).json(candidate);
    } catch (error) {
        res.status(400).json({ error: 'Candidate creation failed' });
    }
});

export default router;
