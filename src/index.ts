import { processDoc, processText } from './worker.js';
import { Message } from 'node-telegram-bot-api';

const reply = async (apiKey: string, chatId: number, text: string) => {
	const url = `https://api.telegram.org/bot${apiKey}/sendMessage?chat_id=${chatId}&text=${text}`;
	const data = await fetch(url).then(resp => resp.json());

	console.log('replyed', data);
};

export const processTelegramWebHook = async (message: Message): Promise<Response> => {
	const chatId = message.chat.id;

	try {
		const messageText = message.text;

		if (message.document) {
			console.log('processing document');

			const results = await processDoc(message.document, chatId, message.message_id);
			results.forEach(async res => await reply(process.env.TELEGRAM_API_KEY, chatId, res));
		} else {
			console.log('processing text');

			const results = await processText(message, chatId);
			results.forEach(async res => await reply(process.env.TELEGRAM_API_KEY, chatId, res));
		}

		if (messageText === '/start') {
			await reply(process.env.TELEGRAM_API_KEY, chatId, 'Welcome to the bot!');
		}
	} catch (error) {
		reply(process.env.TELEGRAM_API_KEY, chatId, `Something went wrong :(\n\n${error}`);
	}

	return new Response('OK');
};
