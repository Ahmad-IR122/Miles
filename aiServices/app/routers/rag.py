from fastapi import APIRouter

from app.clients import search_azure, search_web
from app.models import ChatRequest, ChatResponse
from app.services import RAGService
from app.services.search_service import SearchService

router = APIRouter(prefix="/chat", tags=["rag"])
rag_service = RAGService()
search_service = SearchService(azure_search=search_azure, web_search=search_web)


@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest):
    rewritten_query = rag_service.rewrite_query(latest_question=request.message)
    print(f"Rewritten Query: {rewritten_query}")

    results = search_service.retrieve(rewritten_query)
    retrieved_data = SearchService.format_context(results)

    answer = rag_service.generate_response(
        retrieved_data=retrieved_data,
        user_query=rewritten_query,
    )
    return ChatResponse(answer=answer)
