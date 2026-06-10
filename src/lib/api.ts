import { API_URL } from "./config";

function getUrl(path: string) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const baseUrl = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  return new URL(normalizedPath, baseUrl);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getErrorMessage(response: Response) {
  try {
    const body = await response.json();

    if (body && typeof body.message === "string") {
      return body.message;
    }

    if (body && typeof body.error === "string") {
      return body.error;
    }
  } catch {
    return `Request failed with status ${response.status}`;
  }

  return `Request failed with status ${response.status}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = getUrl(path);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}

export async function apiPost<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const url = getUrl(path);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  return (await response.json()) as TResponse;
}

export async function apiGetAuth<T>(path: string, token: string): Promise<T> {
  const url = getUrl(path);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}

export async function apiPostAuth<TResponse, TBody>(path: string, body: TBody, token: string): Promise<TResponse> {
  const url = getUrl(path);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  return (await response.json()) as TResponse;
}

export async function apiPatchAuth<TResponse, TBody>(path: string, body: TBody, token: string): Promise<TResponse> {
  const url = getUrl(path);
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as TResponse;
}
