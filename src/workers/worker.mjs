import {parentPort, workerData} from 'worker_threads'; //Comunicación con el hilo principal y recepción de datos iniciales
import Ffmpeg from 'fluent-ffmpeg'; //proporciona un potente programa de procesamiento multimedia FFmpeg
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

Ffmpeg.setFfmpegPath(ffmpegInstaller.path); //Indica dónde está el ejecutable de FFmpeg

const { inputFile, outputFile } = workerData; // extrae las rutas que envia el hilo principal

Ffmpeg(inputFile)
  .outputOptions('-c:v libx264')  // Usa el codec H.264 para comprimir el video
  .toFormat('mp4')                // Formato de salida MP4
  .save(outputFile)               // Guarda en la ruta especificada
  .on('end', () => parentPort.postMessage({ success: true, outputFile })) //Cuando termina exitosamente, envía un mensaje al hilo principal
  .on('error', (err) => parentPort.postMessage({ success: false, error: err.message })); //Cuando ocurra un error, envia un mensaje al hilo principal