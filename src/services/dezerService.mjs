import fetch from "node-fetch";

const DEEZER_API = "https://api.deezer.com";

// Buscar canciones por query
export async function fetchDeezerTracks(query) {
  const res = await fetch(`${DEEZER_API}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Error al buscar canciones en Deezer");
  const data = await res.json();
  return data.data; // lista de canciones
}

// Obtener metadata del track por ID
export async function fetchDeezerTrackById(id) {
  const res = await fetch(`${DEEZER_API}/track/${id}`);
  if (!res.ok) throw new Error("Error al obtener metadata de track en Deezer");
  return await res.json(); // objeto de track con campos: id, title, artist, album, preview
}
