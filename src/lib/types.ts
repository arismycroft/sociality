// Tipe berdasarkan response nyata dari API (lihat catatan di src/lib/api.ts).

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Page<T> {
  items: T[];
  pagination: Pagination;
}

export interface Author {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
}

/** Item post. Di daftar "saved" hanya 4 field pertama yang ada. */
export interface Post {
  id: number;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
  author?: Author;
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
}

export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: Author;
  /** Hanya ada di response pembuatan komentar; di daftar komentar tidak ada. */
  isMine?: boolean;
}

/** Item user di search / likes / followers / following. */
export interface UserItem extends Author {
  isFollowedByMe: boolean;
  /** Tidak selalu ada (mis. di daftar followers/following). */
  isMe?: boolean;
  followsMe?: boolean;
}

export interface SessionUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
}

export interface MyProfile {
  profile: SessionUser & { bio: string | null; createdAt: string };
  stats: { posts: number; followers: number; following: number; likes: number };
}

export interface PublicProfile {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  counts: { post: number; followers: number; following: number; likes: number };
  isFollowing: boolean;
  isMe: boolean;
}
