import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get all elections
router.get('/', async (req, res) => {
    const elections = await prisma.election.findMany({
        include: { candidates: true },
    });
    res.json(elections);
});

// Get election by contract ID
router.get('/:id', async (req, res) => {
    const election = await prisma.election.findUnique({
        where: { contractId: parseInt(req.params.id) },
        include: { candidates: true },
    });
    if (election) {
        res.json(election);
    } else {
        res.status(404).json({ message: 'Election not found' });
    }
});

// Create election (Admin only)
router.post('/', authMiddleware, async (req: any, res) => {
    const { contractId, title, description, ipfsHash } = req.body;
    try {
        const election = await prisma.election.create({
            data: { contractId, title, description, ipfsHash },
        });
        res.status(201).json(election);
    } catch (error) {
        res.status(400).json({ error: 'Election creation failed' });
    }
});

export default router;
