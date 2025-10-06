import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { saveDownload } from "../services/db.mjs";
import { downloadsPath } from "../utils/paths.mjs";
import { fetchDeezerTracks,fetchDeezerTrackById } from "../services/dezerService.mjs";

// Buscar canciones
export async function searchTracks(req, res) {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const query = urlObj.searchParams.get("query");

    if (!query) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Debe enviar ?query=palabra" }));
    }

    const tracks = await fetchDeezerTracks(query);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(tracks));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Descargar preview por ID
export async function downloadTrack(req, res) {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const trackId = urlObj.searchParams.get("id");

    if (!trackId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Debe enviar ?id=trackId" }));
    }

    // 1️⃣ Obtener metadata
    const track = await fetchDeezerTrackById(trackId);

    if (!track.preview) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "El track no tiene preview disponible" }));
    }

    // 2️⃣ Descargar el preview MP3 (30s)
    const previewResp = await fetch(track.preview);
    const buffer = Buffer.from(await previewResp.arrayBuffer());

    // 3️⃣ Guardar en carpeta /downloads
    const safeFileName = `${track.title.replace(/[^\w\d_-]+/g, "_")}_preview.mp3`;
    const filePath = path.join(downloadsPath, safeFileName);
    fs.writeFileSync(filePath, buffer);

    // 4️⃣ Guardar en BD
    await saveDownload(
      {
        id: track.id,
        title: track.title,
        artist: track.artist?.name,
        description: track.album?.title,
        duration: track.duration,
        stream_url: track.preview
      },
      buffer
    );

    // 5️⃣ Enviar al cliente
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename=${safeFileName}`,
    });
    res.end(buffer);

  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}
