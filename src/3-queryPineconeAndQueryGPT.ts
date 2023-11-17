// 1. Import required modules
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from 'langchain/llms/openai';
import { VectorDBQAChain, loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { Pinecone } from '@pinecone-database/pinecone';
import { Vector } from './2-updatePinecone.js';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { reply } from './index.js';

// 2. Export the queryPineconeVectorStoreAndQueryLLM function
export const queryPineconeVectorStoreAndQueryLLM = async (
	client: Pinecone,
	indexName: string,
	question: string,
	telegramChatId: number
) => {
	// 3. Start query process
	console.log('Querying Pinecone vector store...');
	// 4. Retrieve the Pinecone index
	const index = client.Index(indexName);
	// 5. Create query embedding
	const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);
	// 6. Query Pinecone index and return top 10 matches
	let queryResponse = await index.query({
		topK: 10,
		vector: queryEmbedding,
		includeMetadata: true,
		includeValues: true,
		filter: {
			telegramChatId,
		},
	});

	const llm = new OpenAI({ modelName: 'gpt-4-1106-preview', maxTokens: 1500 });

	const vectorStore = await PineconeStore.fromExistingIndex(
		new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
		{
			pineconeIndex: index,
			filter: {
				telegramChatId,
			},
		}
	);
	const chain = VectorDBQAChain.fromLLM(llm, vectorStore, {
		k: 10,
		returnSourceDocuments: true,
	});

	const response = await chain.call({ query: question });
	reply(telegramChatId, JSON.stringify(response));

	if (queryResponse?.matches?.length) {
		const chain = loadQAStuffChain(llm);
		// 10. Extract and concatenate page content from matched documents
		const concatenatedPageContent = queryResponse.matches
			.map(match => (match as Vector)?.metadata?.pageContent)
			.join(' ');
		// 11. Execute the chain with input documents and question
		const result = await chain.call({
			input_documents: [new Document({ pageContent: concatenatedPageContent })],
			question: question,
		});
		// 12. Log the answer
		return result.text;
	} else {
		// 13. Log that there are no matches, so GPT-3 will not be queried
		console.log('Since there are no matches, GPT will not be queried.');
	}
};
