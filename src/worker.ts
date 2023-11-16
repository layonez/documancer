import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PineconeClient } from '@pinecone-database/pinecone';
import { updatePinecone } from './2-updatePinecone.js';
import { queryPineconeVectorStoreAndQueryLLM } from './3-queryPineconeAndQueryGPT.js';
import { Message } from 'node-telegram-bot-api';
import * as TelegramBot from 'node-telegram-bot-api';
import { Document } from 'langchain/document';

const indexName = 'your-pinecone-index-name';

const initPinecneClient = async (pineconeEnv: string, pineconeToken: string) => {
	const client = new PineconeClient();
	await client.init({
		apiKey: pineconeToken,
		environment: pineconeEnv,
	});

	return client;
};

export const processText = async (msg: Message, chatId: number) => {
	if (!msg?.text?.length || msg?.text?.length < 15) {
		return ['Query is too short, please be more specific with your request'];
	}
	const client = await initPinecneClient(
		process.env.PINECONE_ENVIRONMENT,
		process.env.PINECONE_API_KEY
	);
	const result = await queryPineconeVectorStoreAndQueryLLM(client, indexName, msg.text);

	return [result];
};

export type DocumentMetadata = {
	id: string;
	name?: string;
	messageId: number;
	chatId: number;
};

export type PdfType = {
	telegram: DocumentMetadata;
	source?: string;
	blobType?: string;
	pdf?: {
		version?: string;
		info?: {
			PDFFormatVersion?: string;
			IsAcroFormPresent?: boolean;
			IsXFAPresent?: boolean;
			Title?: string;
			Creator?: string;
			Producer?: string;
			CreationDate?: string;
			ModDate?: string;
		};
		metadata?: null;
		totalPages?: number;
	};
};

export const processDoc = async (doc: TelegramBot.Document, chatId: number, messageId: number) => {
	if (doc.mime_type !== 'application/pdf') {
		return ['We only accept pdfs for now :('];
	}

	const results = await importPdf(doc.file_id, {
		id: doc.file_id,
		name: doc.file_name,
		messageId,
		chatId,
	});

	return results;
};

export const importPdf = async (fileId: string, meta: DocumentMetadata) => {
	const fileBuffer = (await downloadFile(fileId)) as Buffer;

	const loader = new PDFLoader(new Blob([fileBuffer]), { splitPages: false });
	const doc = (await loader.load())[0];

	doc.metadata.telegram = meta;

	const client = await initPinecneClient(
		process.env.PINECONE_ENVIRONMENT,
		process.env.PINECONE_API_KEY
	);
	return await updatePinecone(client, indexName, doc as unknown as Document<PdfType>, fileBuffer);
};

export const downloadFile = async (fileId: string) => {
	const res = await fetch(
		`https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/getFile?file_id=${fileId}`
	);

	const fileIdResponse = (await res.json()) as { result: TelegramBot.File; ok: boolean };
	if (!fileIdResponse.ok) {
		console.error('Cannot retrive file id', fileId);
		throw Error('Cannot retrive file id');
	}
	const filePath = fileIdResponse.result.file_path;

	const downloadURL = `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_KEY}/${filePath}`;

	const resp = await fetch(downloadURL);
	if (!resp.ok) {
		console.error('Cannot retrive file', resp.status);
		throw Error('Cannot retrive file');
	}
	return await resp.arrayBuffer();
};
