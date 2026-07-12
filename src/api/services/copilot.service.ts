import Cookies from "js-cookie";
import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

const { VITE_BASE_URL, VITE_END_WITH_DOMAIN, VITE_SUB_DOMAIN } = import.meta.env;

const getBaseURL = () => {
  const host = window.location.hostname;
  if (host.endsWith(VITE_END_WITH_DOMAIN)) return VITE_SUB_DOMAIN;
  return VITE_BASE_URL;
};

export interface ChatSessionItem {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageItem {
  _id: string;
  role: "user" | "model";
  content: string;
  attachments?: Array<{ name: string; mimeType: string }>;
  createdAt: string;
}

export interface FileAttachment {
  name: string;
  mimeType: string;
  data: string; // base64
}

export interface SSEEvent {
  type: "session" | "userMessageId" | "aiMessageId" | "token" | "title" | "status" | "done" | "error";
  content?: string;
  sessionId?: string;
  messageId?: string;
  title?: string;
  message?: string;
}

// ── REST endpoints ────────────────────────────────────────────────────────────

export const getSessions = (): Promise<{ data: { sessions: ChatSessionItem[]; schoolLogo: string | null } }> =>
  adminApiService.get(Api.COPILOT_SESSIONS);

export const createSession = (): Promise<{ data: { session: ChatSessionItem } }> =>
  adminApiService.post(Api.COPILOT_SESSIONS);

export const deleteSession = (id: string): Promise<unknown> =>
  adminApiService.delete(`${Api.COPILOT_SESSIONS}/${id}`);

export const getMessages = (
  sessionId: string
): Promise<{ data: { session: ChatSessionItem; messages: ChatMessageItem[] } }> =>
  adminApiService.get(`${Api.COPILOT_SESSION_MESSAGES}/${sessionId}/messages`);

export const renameSession = (
  sessionId: string,
  title: string
): Promise<{ data: { title: string } }> =>
  adminApiService.patch(`${Api.COPILOT_SESSIONS}/${sessionId}/title`, { title });

// ── Token refresh helper (SSE bypasses axios interceptor) ────────────────────

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const res = await fetch(`${getBaseURL()}/${Api.REFRESH_TOKEN}`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken: string | undefined = data?.data?.accessToken;
    if (newToken) {
      const { getCookieDomain } = await import("@/apps/common/commonJsFunction");
      Cookies.set("auth_token", newToken, { expires: 7, domain: getCookieDomain(), path: "/" });
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
};

// ── SSE streaming chat ────────────────────────────────────────────────────────

const doSSERequest = async (
  params: { sessionId?: string; message: string; files?: FileAttachment[] },
  token: string,
  ctrl: AbortController,
  onEvent: (event: SSEEvent) => void,
  onComplete: () => void,
  onError: (err: string) => void,
  isRetry = false
) => {
  try {
    const response = await fetch(`${getBaseURL()}/${Api.COPILOT_CHAT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(params),
      signal: ctrl.signal,
    });

    // Token expired — try refresh once
    if (response.status === 401 && !isRetry) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return doSSERequest(params, newToken, ctrl, onEvent, onComplete, onError, true);
      }
      onError("Session expired. Please log in again.");
      return;
    }

    if (!response.ok) {
      try {
        const errData = await response.json();
        onError(errData?.message ?? `Request failed: ${response.status}`);
      } catch {
        onError(`Request failed: ${response.status}`);
      }
      return;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (!raw) continue;
        try {
          const evt = JSON.parse(raw) as SSEEvent;
          onEvent(evt);
          if (evt.type === "done") { onComplete(); return; }
          if (evt.type === "error") { onError(evt.message ?? "AI error"); return; }
        } catch {
          // skip malformed chunks
        }
      }
    }
    onComplete();
  } catch (err: unknown) {
    if ((err as Error).name !== "AbortError") {
      onError((err as Error).message ?? "Network error");
    }
  }
};

export const streamChat = (
  params: { sessionId?: string; message: string; files?: FileAttachment[] },
  onEvent: (event: SSEEvent) => void,
  onComplete: () => void,
  onError: (err: string) => void
): (() => void) => {
  const ctrl = new AbortController();
  const token = Cookies.get("auth_token") ?? "";
  doSSERequest(params, token, ctrl, onEvent, onComplete, onError);
  return () => ctrl.abort();
};
