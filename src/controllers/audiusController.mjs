import fetch from 'node-fetch';
import { saveDownload } from '../services/db.mjs';

export async function searchTracks(req, res) {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const query = urlObj.searchParams.get('query');

    if (!query) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Debe enviar ?query=palabra' }));
    }

    const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=miApp`);
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

    const trackResp = await fetch(`https://discoveryprovider.audius.co/v1/tracks/${trackId}?app_name=miApp`);
    const trackData = (await trackResp.json()).data;

    await saveDownload(trackData);

    const streamResp = await fetch(`https://discoveryprovider.audius.co/v1/tracks/${trackId}/stream?app_name=miApp`);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename=${trackData.title.replace(/\s+/g,'_')}.mp3`
    });

    streamResp.body.pipe(res);

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}
