// --- 1. IMPORTACIONES NATIVAS Y DE TERCEROS ---
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node'; 
import express, { Request, Response, NextFunction } from 'express'; 
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import 'zone.js/node'; // Requerido por Angular

// --- 2. IMPORTACIONES DEL BACKEND ---
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import cors from 'cors';
//import bodyParser from 'body-parser';
import { json } from 'body-parser';

// Nota: Asegúrate de que esta ruta sea correcta si tu modelo está en 'src/app/models/'
import { EncryptedData } from './app/Models/encrypted-data.model'; 

// --- 3. CONFIGURACIÓN DEL BACKEND ---
const MONGODB_URI = 'mongodb+srv://userSystem:w8c7XzUvR5kj0VYy@cluster0.mx0rcm2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Carga de la clave pública. process.cwd() apunta a la raíz del proyecto.
const publicKey = fs.readFileSync(join(process.cwd(), 'public.pem'), 'utf8');
const ENCRYPTION_PADDING = crypto.constants.RSA_PKCS1_PADDING; 

// Conexión a MongoDB
mongoose.connect(MONGODB_URI as string)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));


// --- 4. FUNCIÓN CENTRAL DE ENCRIPTACIÓN RSA ---
function encryptRSA(plaintext: string, publicKey: string): string {
  try {
    const buffer = Buffer.from(plaintext, 'utf8');
    const encryptedBuffer = crypto.publicEncrypt({
      key: publicKey,
      padding: ENCRYPTION_PADDING,
    }, buffer);
    return encryptedBuffer.toString('base64');
  } catch (error) {
    throw new Error('Fallo al encriptar. Revise el tamaño del texto.');
  }
}
// --- FIN FUNCIÓN CENTRAL ---


// --- 5. FUNCIÓN PRINCIPAL DE EXPRESS ---
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/voiceLogin/browser'); 
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index.csr.html';

  // Agregamos el CommonEngine para Angular SSR 
  const commonEngine = new CommonEngine();
  
  // --- 6. MIDDLEWARE Y ENDPOINT DE API ---
  
  // Middleware para manejar JSON y CORS
  server.use(cors()); 
  //server.use(bodyParser.json()); 
  server.use(json()); 
  
  server.get('/api/records', async (req: Request, res: Response) => {
    try {
        // Busca todos los documentos en la colección EncryptedData
        const records = await EncryptedData.find({});

        // Devuelve el listado de registros
        res.status(200).json(records);

    } catch (error) {
        console.error('Error al obtener los registros:', error);
        res.status(500).json({ error: 'Fallo al obtener el listado de registros.' });
    }
});

  // El endpoint de encriptación (debe ir antes del renderizado de Angular)
  server.post('/api/encryptUserName', async (req: Request, res: Response) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El campo "name" es requerido.' });
    }

    try {
      const encryptedString = encryptRSA(name, publicKey);

      const newEncryptedData = new EncryptedData({
        originalText: name, 
        encryptedText: encryptedString
      });
      await newEncryptedData.save();

      return res.status(200).json({
        message: 'Texto encriptado y almacenado con correctamente.',
        encryptedText: encryptedString
    });

    } catch (error: any) {
      console.error('Error en el servicio:', error.message);
      return res.status(500).json({ error: error.message });

    }
  });

  // --- 7. CÓDIGO DE RENDERIZADO DE ANGULAR UNIVERSAL ---
  
  // Sirve archivos estáticos (CSS, JS, imágenes) desde la carpeta 'browser'
  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.use(express.static(distFolder, {
     maxAge: '1y'
  }));

  // Sirve la aplicación Angular en todas las demás rutas
  server.use((req: Request, res: Response, next: NextFunction) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine.render({
        documentFilePath: join(distFolder, indexHtml),
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: distFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    }).then((html: string) => res.send(html)).catch((err: Error) => next(err));
  });

  return server;
}

// ... (El resto del código que arranca el servidor al final de server.ts) ...

function run(): void {
 const port = process.env['PORT'] || 4000;

 // Start up the Node server
 const server = app();
 server.listen(port, () => {
  console.log(`Angular Universal Server listening on http://localhost:${port}`);
 });
}

run();