import express from 'express';
import Docker from 'dockerode';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/containers', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const watchedContainers = containers.filter(c => c.Labels['com.lighthouse.enable'] === 'true');
    res.json(watchedContainers);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching containers');
  }
});

app.get('/api/lighthouse/logs', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const lighthouse = containers.find(c => c.Image.includes('lighthouse') || c.Names.some(n => n.includes('lighthouse')));
    
    if (!lighthouse) {
      return res.status(404).send('Lighthouse container not found');
    }

    const container = docker.getContainer(lighthouse.Id);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail: 100,
      timestamps: true
    });
    
    res.send(logs.toString('utf-8'));
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching logs');
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
