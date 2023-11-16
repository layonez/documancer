declare namespace NodeJS {
	interface ProcessEnv {
		TELEGRAM_API_KEY: string;
		PINECONE_ENVIRONMENT: string;
		PINECONE_API_KEY: string;
		OPENAI_API_KEY: string;
	}
}
