import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { testMessageWithFile } from './testData.js';
import { processTelegramWebHook } from './index.js';

dotenv.config();
console.log(process.env.TELEGRAM_API_KEY);

const app: Express = express();
const port = process.env.PORT;

app.get('/', async (req: Request, res: Response) => {
	console.log('processing test message');
	const resp = await processTelegramWebHook(testMessageWithFile);
	res.send(resp);
});

app.post('/', (req: Request, res: Response) => {
	res.send('Express + TypeScript Server');
});

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
