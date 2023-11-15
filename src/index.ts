import { processDoc, processText } from './worker';
import { Message } from 'node-telegram-bot-api';

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	TELEGRAM_API_KEY: string;
	PINECONE_ENVIRONMENT: string;
	PINECONE_API_KEY: string;
	OPENAI_API_KEY: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method === 'POST') {
			const payload = (await request.json()) as unknown;

			// Type Guard: Check whether payload is of the expected type
			if (typeof payload === 'object' && payload !== null && 'message' in payload) {
				const msg = payload.message as Message;
				const chatId = msg.chat.id;

				try {
					const messageText = msg.text;

					if (msg.document) {
						processDoc(msg.document, chatId, env);
					} else {
						processText(msg, chatId, env);
					}

					if (messageText === '/start') {
						await this.sendMessage(env.TELEGRAM_API_KEY, chatId, 'Welcome to the bot!');
					}
				} catch (error) {
					this.sendMessage(env.TELEGRAM_API_KEY, chatId, `Something went wrong :(\n\n${error}`);
				}
			}
		}
		return new Response('OK');
	},
	async sendMessage(apiKey: string, chatId: number, text: string) {
		const url = `https://api.telegram.org/bot${apiKey}/sendMessage?chat_id=${chatId}&text=${text}`;
		const data = await fetch(url).then(resp => resp.json());
	},
};
