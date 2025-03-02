import { writeFile, readFile, existsSync } from 'fs/promises';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    // Use absolute path for better file management
    const filePath = path.join(process.cwd(), 'data', 'tasks.json');
    
    // Check if running in Vercel environment
    const isVercel = process.env.VERCEL === 'true';

    if (req.method === 'POST') {
        try {
            const data = req.body;

            if (isVercel) {
                // Handle data via database or external storage in production
                // Add your database code here
                return res.json({ status: 'success' });
            }

            // For local development, write to the file system
            if (!existsSync(filePath)) {
                await writeFile(filePath, JSON.stringify([]));
            }
            await writeFile(filePath, JSON.stringify(data, null, 2));
            return res.json({ status: 'success' });
        } catch (error) {
            return res.status(500).json({ error: 'Ошибка записи файла' });
        }
    }

    if (req.method === 'GET') {
        try {
            if (isVercel) {
                // Fetch data from the database or external storage in production
                // Add your database code here
                return res.json([]); // Placeholder, replace with database data
            }

            // For local development, read from the file system
            const data = await readFile(filePath, 'utf8');
            return res.json(JSON.parse(data || '[]'));
        } catch (error) {
            return res.status(500).json({ error: 'Ошибка чтения файла' });
        }
    }

    res.status(405).json({ error: 'Метод не разрешен' });
}
