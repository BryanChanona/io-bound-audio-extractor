import { db } from './db.mjs';
import { DownloadModel } from '../models/Download.mjs';
export async function saveDownload(track) {
  // Creamos un objeto modelo que encapsula la entidad
  const download = new DownloadModel(track);

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

  return await db.query(sql, params);
}
