import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import electionRoutes from './routes/elections';
import candidateRoutes from './routes/candidates';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/candidates', candidateRoutes);

app.get('/', (req, res) => {
  res.send('Decentralized Voting API');
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
