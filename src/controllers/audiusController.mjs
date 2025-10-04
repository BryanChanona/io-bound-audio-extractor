import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { saveDownload } from '../services/db.mjs';
import { downloadsPath } from '../config/paths.mjs'; // carpeta central de descargas

export async function searchTracks(req, res) {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const query = urlObj.searchParams.get('query');

    if (!query) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Debe enviar ?query=palabra' }));
    }

    const response = await fetch(
      `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=miApp`
    );
    const data = await response.json();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data.data));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

export async function downloadTrack(req, res) {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const trackId = urlObj.searchParams.get('id');

    if (!trackId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Debe enviar ?id=trackId' }));
    }

    // 1️⃣ Obtener metadatos del track
    const trackResp = await fetch(
      `https://discoveryprovider.audius.co/v1/tracks/${trackId}?app_name=miApp`
    );
    const trackData = (await trackResp.json()).data;

    // 2️⃣ Obtener stream del track
    const streamResp = await fetch(
      `https://discoveryprovider.audius.co/v1/tracks/${trackId}/stream?app_name=miApp`
    );
    const buffer = Buffer.from(await streamResp.arrayBuffer());

    // 3️⃣ Guardar en BD + carpeta downloads
    await saveDownload(trackData, buffer); // ahora saveDownload recibe buffer

    // 4️⃣ Preparar headers para enviar al cliente
    const safeFileName = `${trackData.title.replace(/[^\w\d_-]+/g, '_')}.mp3`;
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename=${safeFileName}`
    });

    // 5️⃣ Enviar el audio al cliente
    res.end(buffer);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}
