import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config()

/**
 * Clase Database que implementa el patrón Singleton
 * Garantiza una única instancia de conexión a MySQL en toda la aplicación
 */
class Database {
    constructor() {
        // Si ya existe una instancia, retornarla en lugar de crear una nueva
        // Esto asegura que solo haya un pool de conexiones en toda la app
        if (Database.instance) {
            return Database.instance;
        }

        // Inicializar el pool como null (se creará en el método connect)
        this.pool = null;
        
        // Guardar esta instancia como la única instancia de la clase
        Database.instance = this;
    }

    async connect() {
        // Si el pool ya está creado, reutilizarlo
        if (this.pool) {
            console.log('Usando conexión existente');
            return this.pool;
        }

        try {
            // Crear el pool de conexiones con la configuración
            this.pool = mysql.createPool({
                host: process.env.DB_HOST,           
                user: process.env.DB_USER,          
                password: process.env.DB_PASSWORD,   
                database: process.env.DB_NAME,       
                waitForConnections: true,            // Esperar si no hay conexiones disponibles
                connectionLimit: 10,                 // Máximo 10 conexiones simultáneas
                queueLimit: 0                        // Sin límite de solicitudes en espera
            });

            console.log('Pool de conexiones MySQL creado exitosamente');

            // Obtener una conexión del pool para verificar que funciona correctamente
            const connection = await this.pool.getConnection();
            console.log('Conexión a MySQL establecida correctamente');
            
            // Liberar la conexión de vuelta al pool (no cerrarla, solo devolverla)
            connection.release();

            return this.pool;
        } catch (error) {
            console.error('Error al conectar con MySQL:', error.message);
            throw error;
        }
    }
}

// Crear la única instancia de Database (Singleton)
const db = new Database();


// Exportar la instancia única para usar en toda la aplicación
export default db;