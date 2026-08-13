from fastapi import APIRouter

from app.models.rag import ChatRequest, ChatResponse
from app.services.rag import RAGService

router = APIRouter(prefix="/chat", tags=["rag"])
rag_service = RAGService()


@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest):
    """/chat endpoint handles the chat interaction by rewriting the user's query, retrieving relevant information, and generating a response.

    Args:
        request (ChatRequest): The chat request containing the user's message.

    Returns:
        ChatResponse: The chat response containing the generated answer.
    """

    # 1. Rewrite latest question using history
    rewritten_query = rag_service.rewrite_query(
        latest_question=request.message,
    )
    print(f"Rewritten Query: {rewritten_query}")

    # 2. Retrieve using rewritten query
    retrieved_data = []  # placeholder for retrieval logic, to be implemented later

    # 3. Generate answer using retrieved data + rewritten query
    answer = rag_service.generate_response(
        retrieved_data=retrieved_data,
        user_query=rewritten_query,
    )

    return ChatResponse(answer=answer)
