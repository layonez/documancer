import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { testMessageWithFile } from './testData.js';
import { processTelegramWebHook } from './index.js';

dotenv.config();
console.log(process.env.TELEGRAM_API_KEY);

const app: Express = express();
const port = process.env.PORT;

// middlewares
app.use(express.json())

app.get('/test', async (req: Request, res: Response) => {
	console.log('processing test message');
	const resp = await processTelegramWebHook(testMessageWithFile);
	res.send(resp);
});

app.post('/', async (req: Request, res: Response) => {
	try {
		console.log('received new message', req.body);
		const { message } = req.body;
		const resp = await processTelegramWebHook(message);
		res.send(resp);
	} catch (error) {
		res.status(500).send(error);
	}
    
});

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
