import http from 'node:http';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import Ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { JamendoRoutes } from './src/routes/jamendo.routes.mjs';
import { audiusRouter } from './src/routes/audiusRoutes.mjs';

dotenv.config();

// Directorios para subida y salida
const uploadDir = path.resolve('./uploads');
const outputDir = path.resolve('./output');

// Crear carpetas si no existen
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Configurar ffmpeg
Ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Función para convertir el archivo MP3 a MP4 en el hilo principal
function convertMP3toMP4(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    Ffmpeg(inputFile)
      .outputOptions('-c:v libx264')
      .toFormat('mp4')
      .save(outputFile)
      .on('end', () => resolve(outputFile))
      .on('error', (err) => reject(err));
  });
}

// Puerto del servidor
const PORT = process.env.PORT || 8000;

// Servidor principal (sin cluster)
const server = http.createServer(async (req, res) => {
  try {
    // Rutas personalizadas
    if (req.url.startsWith('/jamendo/')) return JamendoRoutes(req, res);
    if (req.url.startsWith('/audius/')) return audiusRouter(req, res);

    // Ruta para subir archivo
    if (req.method === 'POST' && req.url === '/upload') {
      const filename = `file-${Date.now()}.mp3`;
      const filepath = path.join(uploadDir, filename);

      // Guardar archivo recibido
      await pipeline(req, fs.createWriteStream(filepath));

      // Convertir el archivo directamente (sin worker)
      const outputFile = path.join(outputDir, filename.replace('.mp3', '.mp4'));
      await convertMP3toMP4(filepath, outputFile);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Archivo convertido', outputFile }));
    }

    // Ruta por defecto
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Servidor sin concurrencia ejecutándose en un solo hilo\n');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
