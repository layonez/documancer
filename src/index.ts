import { processDoc, processText } from './worker.js';
import { Message } from 'node-telegram-bot-api';

export const reply = async (chatId: number, text: string) => {
	const url = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${text}`;
	const data = await fetch(url).then(resp => resp.json());

	console.log('replyed', data);
};

export const processTelegramWebHook = async (message: Message): Promise<Response> => {
	const chatId = message.chat.id;

	if (chatId !== 1336951) {
		await reply(chatId, 'Bro, you are not authorized yet to access me');

		return new Response('OK');
	}

	try {
		const messageText = message.text;

		if (message.document) {
			console.log('processing document');

			const results = await processDoc(message.document, chatId, message.message_id);
			results.forEach(async res => await reply(chatId, res));
		} else {
			console.log('processing text');

			const results = await processText(message, chatId);
			results.forEach(async res => await reply(chatId, res));
		}

		if (messageText === '/start') {
			await reply(chatId, 'Welcome to the bot!');
		}
	} catch (error) {
		reply(chatId, `Something went wrong :(\n\n${error}`);
	}

	return new Response('OK');
};
