import { fetchTracksByQuery,fetchTrackById } from '../services/audiusService.mjs';
import url from 'url';

export async function searchTracks(req, res) {
  try {
    const queryObj = url.parse(req.url, true).query;
    const query = queryObj.query;

    if (!query) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Debe enviar ?query=palabra' }));
    }

    const tracks = await fetchTracksByQuery(query);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tracks));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

export async function downloadTrack(req, res) {
  try {
    const queryObj = url.parse(req.url, true).query;
    const trackId = queryObj.id;

    if (!trackId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Debe enviar ?id=trackId' }));
    }

    const stream = await fetchTrackById(trackId);

    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename=track-${trackId}.mp3`
    });

    stream.pipe(res); // streaming directo
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}
