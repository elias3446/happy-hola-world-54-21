
export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  retrievedDocuments?: string[]; // Added for RAG functionality
}

export interface GeminiMessageContent {
  role: "user" | "model";
  parts: { text: string }[];
}
