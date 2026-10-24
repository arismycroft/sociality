import type {
  Comment,
  MyProfile,
  Page,
  Pagination,
  Post,
  PublicProfile,
  SessionUser,
  UserItem,
} from "./types";

/*
 * Catatan kontrak API (dari response nyata):
 * - Semua response: { success, message, data }. Error: success=false, data=null.
 * - Kunci daftar berbeda per endpoint: items (feed, me/posts), posts (me/saved,
 *   users/{u}/posts), comments, users. Semua dinormalkan ke { items, pagination }.
 * - Status follow: isFollowing (profil publik) vs isFollowedByMe (daftar user).
 * - Tidak ada flag "saved" di post → dihitung dari daftar /api/me/saved.
 *
 * Terkonfirmasi: POST /api/posts = multipart, field "image" (wajib, JPG/PNG/WEBP
 * maks 5MB) dan "caption" (opsional); sukses = 201.
 *
 * Terkonfirmasi: GET /api/users/search wajib punya query "q" (page=1, limit=20
 * default); jangan panggil dengan q kosong.
 * Terkonfirmasi: POST /api/posts/{id}/comments mengembalikan komentar baru
 * (id, text, createdAt, author, isMine) dengan pesan "Comment created".
 *
 * ASUMSI yang belum dikonfirmasi (ubah di sini jika berbeda):
 * - POST /api/posts/{id}/comments: body JSON { text } (cocok dengan contoh Swagger).
 * - Like/Save/Follow: POST/DELETE tanpa body.
 */

const BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://be-social-media-api-production.up.railway.app";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let tokenGetter: () => string | null = () => null;
let unauthorizedHandler: () => void = () => {};

export function configureApi(opts: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  tokenGetter = opts.getToken;
  unauthorizedHandler = opts.onUnauthorized;
}

type Query = Record<string, string | number | undefined>;

async function request<T>(
  path: string,
  init: Omit<RequestInit, "body"> & { query?: Query; json?: unknown; form?: FormData } = {},
): Promise<T> {
  const { query, json, form, headers, ...rest } = init;
  const url = new URL(path, BASE);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const h = new Headers(headers);
  const token = tokenGetter();
  if (token) h.set("Authorization", `Bearer ${token}`);

  let body: BodyInit | undefined;
  if (form) body = form; // browser mengisi boundary multipart sendiri
  else if (json !== undefined) {
    h.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }

  let res: Response;
  try {
    res = await fetch(url, { ...rest, headers: h, body });
  } catch {
    throw new ApiError("Network error. Please check your connection.", 0);
  }

  let payload: { success?: boolean; message?: string; data?: unknown } | null = null;
  try {
    payload = await res.json();
  } catch {
    /* body kosong */
  }

  if (!res.ok || payload?.success === false) {
    if (res.status === 401 && token) unauthorizedHandler();
    throw new ApiError(payload?.message ?? `Request failed (${res.status})`, res.status);
  }
  return (payload?.data ?? null) as T;
}

/** Ubah { items|posts|comments|users: [...], pagination } menjadi Page<T>. */
function toPage<T>(data: Record<string, unknown> | null): Page<T> {
  const d = data ?? {};
  const list =
    (d.items as T[] | undefined) ??
    (d.posts as T[] | undefined) ??
    (d.comments as T[] | undefined) ??
    (d.users as T[] | undefined) ??
    (Object.values(d).find(Array.isArray) as T[] | undefined) ??
    [];
  const pagination = (d.pagination as Pagination | undefined) ?? {
    page: 1,
    limit: list.length,
    total: list.length,
    totalPages: 1,
  };
  return { items: list, pagination };
}

const paged = (page: number, limit: number): Query => ({ page, limit });

/* ---------- Auth ---------- */
export const login = (body: { email: string; password: string }) =>
  request<{ token: string; user: SessionUser }>("/api/auth/login", { method: "POST", json: body });

export const register = (body: {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}) => request<unknown>("/api/auth/register", { method: "POST", json: body });

/* ---------- Me ---------- */
export const getMe = () => request<MyProfile>("/api/me");

export const updateMe = (form: FormData) =>
  request<unknown>("/api/me", { method: "PATCH", form });

export const getMyPosts = (page = 1, limit = 20) =>
  request<Record<string, unknown>>("/api/me/posts", { query: paged(page, limit) }).then((d) =>
    toPage<Post>(d),
  );

export const getMySaved = (page = 1, limit = 20) =>
  request<Record<string, unknown>>("/api/me/saved", { query: paged(page, limit) }).then((d) =>
    toPage<Post>(d),
  );

export const getMyLikes = (page = 1, limit = 20) =>
  request<Record<string, unknown>>("/api/me/likes", { query: paged(page, limit) }).then((d) =>
    toPage<Post>(d),
  );

export const getMyFollowers = (page = 1, limit = 20) =>
  request<Record<string, unknown>>("/api/me/followers", { query: paged(page, limit) }).then((d) =>
    toPage<UserItem>(d),
  );

export const getMyFollowing = (page = 1, limit = 20) =>
  request<Record<string, unknown>>("/api/me/following", { query: paged(page, limit) }).then((d) =>
    toPage<UserItem>(d),
  );

/* ---------- Feed & Posts ---------- */
export const getFeed = (page = 1, limit = 20) =>
  request<Record<string, unknown>>("/api/feed", { query: paged(page, limit) }).then((d) =>
    toPage<Post>(d),
  );

export const getPost = (id: number) => request<Post>(`/api/posts/${id}`);

export const createPost = (form: FormData) =>
  request<Post>("/api/posts", { method: "POST", form });

export const deletePost = (id: number) =>
  request<unknown>(`/api/posts/${id}`, { method: "DELETE" });

/* ---------- Likes & Saves (idempotent) ---------- */
export const likePost = (id: number) =>
  request<unknown>(`/api/posts/${id}/like`, { method: "POST" });
export const unlikePost = (id: number) =>
  request<unknown>(`/api/posts/${id}/like`, { method: "DELETE" });
export const getPostLikes = (id: number, page = 1, limit = 20) =>
  request<Record<string, unknown>>(`/api/posts/${id}/likes`, { query: paged(page, limit) }).then(
    (d) => toPage<UserItem>(d),
  );

export const savePost = (id: number) =>
  request<unknown>(`/api/posts/${id}/save`, { method: "POST" });
export const unsavePost = (id: number) =>
  request<unknown>(`/api/posts/${id}/save`, { method: "DELETE" });

/* ---------- Comments ---------- */
export const getComments = (id: number, page = 1, limit = 10) =>
  request<Record<string, unknown>>(`/api/posts/${id}/comments`, {
    query: paged(page, limit),
  }).then((d) => toPage<Comment>(d));

export const addComment = (id: number, text: string) =>
  request<Comment>(`/api/posts/${id}/comments`, { method: "POST", json: { text } });

export const deleteComment = (id: number) =>
  request<unknown>(`/api/comments/${id}`, { method: "DELETE" });

/* ---------- Users & Follow ---------- */
export const searchUsers = (q: string, page = 1, limit = 20) =>
  request<Record<string, unknown>>("/api/users/search", { query: { q, page, limit } }).then((d) =>
    toPage<UserItem>(d),
  );

export const getUser = (username: string) =>
  request<PublicProfile>(`/api/users/${encodeURIComponent(username)}`);

export const getUserPosts = (username: string, page = 1, limit = 20) =>
  request<Record<string, unknown>>(`/api/users/${encodeURIComponent(username)}/posts`, {
    query: paged(page, limit),
  }).then((d) => toPage<Post>(d));

export const getUserLikes = (username: string, page = 1, limit = 20) =>
  request<Record<string, unknown>>(`/api/users/${encodeURIComponent(username)}/likes`, {
    query: paged(page, limit),
  }).then((d) => toPage<Post>(d));

export const getUserFollowers = (username: string, page = 1, limit = 20) =>
  request<Record<string, unknown>>(`/api/users/${encodeURIComponent(username)}/followers`, {
    query: paged(page, limit),
  }).then((d) => toPage<UserItem>(d));

export const getUserFollowing = (username: string, page = 1, limit = 20) =>
  request<Record<string, unknown>>(`/api/users/${encodeURIComponent(username)}/following`, {
    query: paged(page, limit),
  }).then((d) => toPage<UserItem>(d));

export const followUser = (username: string) =>
  request<unknown>(`/api/follow/${encodeURIComponent(username)}`, { method: "POST" });
export const unfollowUser = (username: string) =>
  request<unknown>(`/api/follow/${encodeURIComponent(username)}`, { method: "DELETE" });
