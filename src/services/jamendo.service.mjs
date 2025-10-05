import fetch from 'node-fetch';
import dotenv from 'dotenv'
dotenv.config()

const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID

export class JamendoService {
    static async searchSongs(query) {
        const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=5&search=${query}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.results;
    }

    static async getSongById(id) {
        const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&id=${id}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.results[0] || null; // Devuelve un solo objeto
    }

}
