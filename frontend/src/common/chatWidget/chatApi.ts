const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
type ChatResponse = {
  reply: string;
  conversation_id: string;
};

type ChatHistoryTurn = {
  user_query: string;
  answer: string;
};

export async function sendChatMessage(
  token: string | null | undefined,
  message: string,
  conversationId?: string,
  tripId?: number,
  history?: ChatHistoryTurn[],
): Promise<ChatResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/chat/message`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message,
      conversation_id: conversationId ?? null,
      trip_id: tripId ?? null,
      history: history && history.length > 0 ? history : null,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  return res.json();
}
