import * as dotenv from 'dotenv';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PineconeClient } from '@pinecone-database/pinecone';
import { updatePinecone } from './2-updatePinecone';
import { queryPineconeVectorStoreAndQueryLLM } from './3-queryPineconeAndQueryGPT';
import { Message } from 'node-telegram-bot-api';
import * as TelegramBot from 'node-telegram-bot-api';
import { Env } from '.';

const pineconeEnv = process.env.PINECONE_ENVIRONMENT;
const pineconeToken = process.env.PINECONE_API_KEY;
const indexName = 'your-pinecone-index-name';

const initPinecneClient = async (pineconeEnv: string, pineconeToken: string) => {
	const client = new PineconeClient();
	await client.init({
		apiKey: pineconeToken,
		environment: pineconeEnv,
	});

	return client;
};

export const processText = async (msg: Message, chatId: number, env: Env) => {
	if (!msg?.text?.length || msg?.text?.length < 15) {
		return ['Query is too short, please be more specific with your request'];
	}
	const client = await initPinecneClient(env.PINECONE_ENVIRONMENT, env.PINECONE_API_KEY);
	const result = await queryPineconeVectorStoreAndQueryLLM(client, indexName, msg.text);

	return [result];
};

export const processDoc = async (doc: TelegramBot.Document, chatId: number, env: Env) => {
	if (doc.mime_type !== 'application/pdf') {
		return ['We only accept pdfs for now :('];
	}

	const results = await importPdf(doc.file_id, env);

	return results;
};

export const importPdf = async (fileId: string, env: Env) => {
	const fileBuffer = (await downloadFile(fileId, env)) as Buffer;

	const loader = new PDFLoader(new Blob([fileBuffer]), { splitPages: false });
	const docs = await loader.load();

	const client = await initPinecneClient(env.PINECONE_ENVIRONMENT, env.PINECONE_API_KEY);
	return await updatePinecone(client, indexName, docs, fileBuffer, env);
};

export const downloadFile = async (fileId: string, env: Env) => {
	const res = await fetch(
		`https://api.telegram.org/bot${env.TELEGRAM_API_KEY}/getFile?file_id=${fileId}`
	);

	const { result } = (await res.json()) as { result: TelegramBot.File };
	const filePath = result.file_path;

	const downloadURL = `https://api.telegram.org/file/bot${env.TELEGRAM_API_KEY}/${filePath}`;

	return await (await fetch(downloadURL)).arrayBuffer();
};
