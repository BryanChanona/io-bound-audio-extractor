import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import process from 'node:process';
import dotenv from 'dotenv';
import { JamendoRoutes } from './src/routes/jamendo.routes.mjs';
import { audiusRouter } from './src/routes/audiusRoutes.mjs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { Worker } from 'worker_threads';
import fs from 'fs';

dotenv.config();

const uploadDir = path.resolve('./uploads');
const outputDir = path.resolve('./output');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

function convertMP3toMP4(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve('./src/workers/worker.mjs'), {
      workerData: { inputFile, outputFile }
    });

    worker.on('message', (msg) => msg.success ? resolve(msg.outputFile) : reject(msg.error));
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

// CPUs y puerto
const numCPUS = availableParallelism();
const PORT = process.env.PORT || 8000;

// Cluster principal
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUS; i++) cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });

} else {
  // Cada worker maneja las solicitudes
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url.startsWith('/jamendo/')) return JamendoRoutes(req, res);
      if (req.url.startsWith('/audius/')) return audiusRouter(req, res);

      if (req.method === 'POST' && req.url === '/upload') {
        const filename = `file-${Date.now()}.mp3`;
        const filepath = path.join(uploadDir, filename);

        // Guardar el MP3 recibido
        await pipeline(req, fs.createWriteStream(filepath));

        const outputFile = path.join(outputDir, filename.replace('.mp3', '.mp4'));
        await convertMP3toMP4(filepath, outputFile);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Archivo convertido', outputFile }));
      }

      // Resto de rutas por defecto
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Hello world from worker ${process.pid}\n`);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} started and listening on port ${PORT}`);
  });
}
