import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export async function downloadAudio(downloadUrl, artist, title) {
  const fileName = `${artist.replace(/\s+/g, "_")}-${title.replace(/\s+/g, "_")}.mp3`;
  const downloadDir = path.resolve("./downloads");
  const filePath = path.join(downloadDir, fileName);

  // Crear carpeta si no existe
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  // Descargar el archivo
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Error al descargar el audio: ${response.statusText}`);
  }

  // Guardar el archivo en disco
  const fileStream = fs.createWriteStream(filePath);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  return filePath;
}