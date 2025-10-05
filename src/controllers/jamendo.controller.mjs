import { JamendoService } from "../services/jamendo.service.mjs";
import { downloadAudio } from "../utils/downloadAudio-jamendo.mjs";

export class JamendoController {
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

  static async downloadById(req, res) {
    const idParam = new URL(req.url, `http://${req.headers.host}`).searchParams.get("id");
    if (!idParam) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "id es requerido" }));
      return;
    }

    try {
      const song = await JamendoService.getSongById(idParam);

      if (!song) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Canción no encontrada" }));
        return;
      }

      const filePath = await downloadAudio(song.audiodownload, song.artist_name, song.name);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Descarga completada",
          path: filePath,
          track: {
            id: song.id,
            title: song.name,
            artist: song.artist_name,
            duration: song.duration,
          },
        })
      );
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}
