const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
type ChatResponse = {
  reply: string;
  conversation_id: string;
};

export async function sendChatMessage(
  token: string,
  message: string,
  conversationId?: string,
  tripId?: number,
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId ?? null,
      trip_id: tripId ?? null,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  return res.json();
}
