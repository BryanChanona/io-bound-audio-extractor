import fetch from 'node-fetch';

const AUDIUS_API = 'https://discoveryprovider.audius.co/v1';

// Buscar canciones
export async function fetchTracksByQuery(query) {
  const res = await fetch(`${AUDIUS_API}/tracks/search?query=${encodeURIComponent(query)}&app_name=miApp`);
  if (!res.ok) throw new Error('Error al buscar tracks en Audius');
  const data = await res.json();
  return data.data; // lista de canciones
}

// Descargar canción por ID
export async function fetchTrackById(id) {
  const res = await fetch(`${AUDIUS_API}/tracks/${id}/stream?app_name=miApp`);
  if (!res.ok) throw new Error('Error al obtener track');
  return res.body; // stream legible
}
