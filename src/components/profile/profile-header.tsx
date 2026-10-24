import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";

interface Props {
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  stats: { posts: number; followers: number; following: number; likes: number };
  /** Basis URL untuk link followers/following, mis. "/me" atau "/profile/bagus". */
  basePath: string;
  actions: React.ReactNode;
}

export function ProfileHeader({ name, username, avatarUrl, bio, stats, basePath, actions }: Props) {
  const items: { label: string; value: number; href?: string }[] = [
    { label: "Post", value: stats.posts },
    { label: "Followers", value: stats.followers, href: `${basePath}/followers` },
    { label: "Following", value: stats.following, href: `${basePath}/following` },
    { label: "Likes", value: stats.likes },
  ];

  return (
    <header className="py-6">
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} name={name} size={80} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold">{name}</h1>
          <p className="truncate text-sm text-muted">{username}</p>
        </div>
        <div className="hidden sm:block">{actions}</div>
      </div>
      {bio && <p className="mt-4 whitespace-pre-line text-sm">{bio}</p>}
      <div className="mt-4 sm:hidden [&>*]:w-full">{actions}</div>

      <dl className="mt-5 grid grid-cols-4 text-center">
        {items.map((s) => {
          const inner = (
            <>
              <dd className="text-lg font-bold">{s.value}</dd>
              <dt className="text-xs text-muted">{s.label}</dt>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="rounded-lg py-1 hover:bg-white/5">
              {inner}
            </Link>
          ) : (
            <div key={s.label} className="py-1">
              {inner}
            </div>
          );
        })}
      </dl>
    </header>
  );
}
