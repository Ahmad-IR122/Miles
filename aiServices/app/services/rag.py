from app.clients.azure_openai import get_client
from app.config.config import settings
from app.prompts.rag_prompts import history_prompt, system_prompt


class RAGService:
    """
    RAGService is a service that handles the retrieval-augmented generation (RAG) process for answering user queries.
    It uses a language model to rewrite user queries, retrieve relevant information, and generate responses based on the retrieved data. The service maintains a history of interactions to improve query rewriting and response generation.
    """

    def __init__(self):
        self._client = get_client()
        self._history_prompt = history_prompt
        self._system_prompt = system_prompt
        self._history = []

    def _ask(self, prompt: str) -> str:
        """_ask is a private method that sends a prompt to the language model and returns the generated response.

        Args:
            prompt (str): The prompt to be sent to the language model.

        Returns:
            str: The generated response from the language model.
        """
        response = self._client.responses.create(
            model=settings.AZURE_OPENAI_DEPLOYMENT,
            input=prompt,
        )
        return response.output_text

    def rewrite_query(self, latest_question: str) -> str:
        """rewrite_query rewrites the latest user question into a standalone search query using the chat history.

        Args:
            latest_question (str): The latest user question.

        Returns:
            str: The rewritten standalone search query.
        """
        if len(self._history) > 0:
            chat_history = "\n".join(  # will be replaced with the last 3 messages in the history
                f"User: {message['user_query']}\n"
                f"Formulated query: {message['formulated_query']}\n"
                f"Answer: {message['answer']}"
                for message in self._history[-3:]
            )
        else:
            chat_history = ""
        prompt = self._history_prompt.format(
            chat_history=chat_history,
            latest_question=latest_question,
        )
        return self._ask(prompt)

    def generate_response(
        self,
        retrieved_data: str,
        user_query: str,
    ) -> str:
        """generate_response generates a response based on the retrieved data and the user query.

        Args:
            retrieved_data (str): The retrieved data.
            user_query (str): The user's query.

        Returns:
            str: The generated response.
        """
        prompt = self._system_prompt.format(
            retrieved_data=retrieved_data,
            user_query=user_query,
        )
        return self._ask(prompt)

    def add_to_history(self, user_query: str, formulated_query: str, answer: str):
        """add_to_history adds the latest interaction to the history of interactions.

        Args:
            user_query (str): The user's query.
            formulated_query (str): The formulated search query.
            answer (str): The generated answer.
        """
        # Add the latest interaction to the history, will be replaced with a database or persistent storage in the future
        self._history.append(
            {
                "user_query": user_query,
                "formulated_query": formulated_query,
                "answer": answer,
            }
        )
