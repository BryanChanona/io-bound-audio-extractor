import { searchTracks, downloadTrack } from "../controllers/audiusController.mjs";

export function audiusRouter(req, res) {
  if (req.method === 'GET' && req.url.startsWith('/audius/search')) {
    return searchTracks(req, res);
  }

  if (req.method === 'GET' && req.url.startsWith('/audius/download')) {
    return downloadTrack(req, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta de Audius no encontrada' }));
}
