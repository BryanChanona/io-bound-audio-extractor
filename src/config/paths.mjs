import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config(); // cargar variables del .env

// Tomar la ruta de descargas desde .env, o usar ./downloads por defecto
const downloadsDirFromEnv = process.env.DOWNLOADS_PATH || './downloads';
export const downloadsPath = path.resolve(downloadsDirFromEnv);

// Crear carpeta si no existe
if (!fs.existsSync(downloadsPath)) {
  fs.mkdirSync(downloadsPath, { recursive: true });
}
