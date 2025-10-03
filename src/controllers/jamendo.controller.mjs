import { title } from "process";
import { JamendoService } from "../services/jamendo.service.mjs";

export class JamendoController {
  // Buscar canciones
  static async search(req, res) {
    const queryParam = new URL(req.url, `http://${req.headers.host}`).searchParams.get("query");
    if (!queryParam) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "query es requerido" }));
      return;
    }

    try {
      const songs = await JamendoService.searchSongs(queryParam);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(songs));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Devolver URL de descarga por ID
  static async downloadById(req, res) {
    const idParam = new URL(req.url, `http://${req.headers.host}`).searchParams.get("id");
    if (!idParam) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "id es requerido" }));
      return;
    }

    try {
      // JamendoService.getSongById devuelve info de la canción incluyendo la URL de audio
      const song = await JamendoService.getSongById(idParam);

      if (!song) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Canción no encontrada" }));
        return;
      }

      const songData = {
        track_id: song.id,
        title: song.name,
        artist: song.artist_name,
        description: song.album_name, // o null si prefieres
        duration: song.duration,
        stream_url: song.audio
      };

      
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(songData)); // 'audio' es el campo con el link MP3
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}
