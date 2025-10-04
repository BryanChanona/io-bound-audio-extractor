import cluster from 'node:cluster'; //Permite crear procesos "workers" que comparten el mismo servidor
import http from 'node:http'; //Módulo para crear un servidor HTTP
import { availableParallelism } from 'node:os';
import process from 'node:process'; //Proporciona información acerca del proceso actual
import dotenv from 'dotenv'
import { JamendoRoutes } from './src/routes/jamendo.routes.mjs';
import { audiusRouter } from './src/routes/audiusRoutes.mjs'; // importamos tus rutas

dotenv.config()

//Obtenemos el número de CPUs disponibles en la máquina
const numCPUS = availableParallelism();
const PORT = process.env.PORT || 8000;


//El cluster principal es quien coordina a los workers.
if (cluster.isPrimary) {

    console.log(`Primary ${process.pid} is running`);

    //Creamos un worker para cada CPU disponible
    for (let i = 0; i < numCPUS; i++) {
        cluster.fork(); //crea un nuevo proceso worker
    }

    //Escuchamos si algún worker se muere
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });

} else {
    const server = http.createServer((req, res) => {
        if (req.url .startsWith('/jamendo/')){
            return JamendoRoutes(req, res)
        }
    
        if (req.url.startsWith('/audius/')) {
            return audiusRouter(req, res);
        }

        // Resto de rutas por defecto
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Hello world from worker ${process.pid}\n`);
    });

    server.listen(PORT, () => {
        console.log(`Worker ${process.pid} started and listening on port ${PORT}`);
    });
}
