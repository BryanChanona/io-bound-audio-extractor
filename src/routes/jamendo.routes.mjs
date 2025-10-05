import { JamendoController } from "../controllers/jamendo.controller.mjs";

export function JamendoRoutes(req, res) {
    if (req.method === 'GET' && req.url.startsWith('/jamendo/search')) {
        return JamendoController.search(req, res);
    }

    if (req.method ==='GET' && req.url.startsWith('/jamendo/download')){
        return JamendoController.downloadById(req, res);
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));

}