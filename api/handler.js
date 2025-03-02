import { writeFile, readFile } from 'fs/promises';

export default async function handler(req, res) {
    const filePath = '../data/tasks.json';

    if (req.method === 'POST') {
        try {
            const data = req.body;
            await writeFile(filePath, JSON.stringify(data, null, 2));
            return res.json({ status: 'success' });
        } catch (error) {
            return res.status(500).json({ error: 'Ошибка записи файла' });
        }
    }

    if (req.method === 'GET') {
        try {
            const data = await readFile(filePath, 'utf8');
            return res.json(JSON.parse(data || '[]'));
        } catch (error) {
            return res.status(500).json({ error: 'Ошибка чтения файла' });
        }
    }

    res.status(405).json({ error: 'Метод не разрешен' });
}
