import { Message } from 'node-telegram-bot-api';

export const testMessageWithFile = {
	message_id: 69,
	from: {
		id: 1336951,
		is_bot: false,
		first_name: 'Artёm',
		username: 'layonez',
		language_code: 'en',
		is_premium: true,
	},
	chat: {
		id: 1336951,
		first_name: 'Artёm',
		username: 'layonez',
		type: 'private',
	},
	date: 1700171758,
	forward_from: {
		id: 1336951,
		is_bot: false,
		first_name: 'Artёm',
		username: 'layonez',
		language_code: 'en',
		is_premium: true,
	},
	forward_date: 1700049555,
	document: {
		file_name: '.trashed-1702362489-Диплом немецк Артем.pdf',
		mime_type: 'application/pdf',
		thumbnail: {
			file_id: 'AAMCAgADGQEAA0VlVo_uWhQ6-Zu846F6ch2mBeeS0wACgz0AAiUxoEot4UsPQptmRgEAB20AAzME',
			file_unique_id: 'AQADgz0AAiUxoEpy',
			file_size: 2500,
			width: 320,
			height: 226,
		},
		thumb: {
			file_id: 'AAMCAgADGQEAA0VlVo_uWhQ6-Zu846F6ch2mBeeS0wACgz0AAiUxoEot4UsPQptmRgEAB20AAzME',
			file_unique_id: 'AQADgz0AAiUxoEpy',
			file_size: 2500,
			width: 320,
			height: 226,
		},
		file_id: 'BQACAgIAAxkBAANFZVaP7loUOvmbvOOhenIdpgXnktMAAoM9AAIlMaBKLeFLD0KbZkYzBA',
		file_unique_id: 'AgADgz0AAiUxoEo',
		file_size: 80965,
	},
} as Message;
