import db from "../config/db.mjs";
import { DownloadModelAudios } from '../models/Download.mjs';
import { downloadsPath } from "../utils/paths.mjs";
import fs from 'node:fs';
import path from 'node:path';

const pool = await db.connect();
Object.freeze(db);

export async function saveDownload(track, fileBuffer) {
  const download = new DownloadModelAudios(track);

  // Nombre seguro y único
  const safeFileName = `${download.title.replace(/[^\w\d_-]+/g,'_')}.mp3`;
  const filePath = path.join(downloadsPath, safeFileName);

  // Guardar archivo en carpeta downloads
  fs.writeFileSync(filePath, fileBuffer);

  const sql = `
    INSERT INTO downloads
    (track_id, title, artist, description, duration, stream_url, file_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    download.track_id,
    download.title,
    download.artist,
    download.description,
    download.duration,
    download.stream_url,
    filePath
  ];

  return await pool.query(sql, params);
}
