import { searchTracks, downloadTrack } from "../controllers/dezerController.mjs";

export function deezerRouter(req, res) {
  if (req.method === "GET" && req.url.startsWith("/deezer/search")) {
    return searchTracks(req, res);
  }

  if (req.method === "GET" && req.url.startsWith("/deezer/download")) {
    return downloadTrack(req, res);
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Ruta de Deezer no encontrada" }));
}
