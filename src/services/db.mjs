import db from "../config/db.mjs";
import { DownloadModelAudios } from '../models/Download.mjs';
const pool = await db.connect();

Object.freeze(db);

export async function saveDownload(track) {
  // Creamos un objeto modelo que encapsula la entidad
  const download = new DownloadModelAudios(track);

  const sql = `
    INSERT INTO downloads
    (track_id, title, artist, description, duration, stream_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    download.track_id,
    download.title,
    download.artist,
    download.description,
    download.duration,
    download.stream_url
  ];
  
  return await pool.query(sql,params)
}