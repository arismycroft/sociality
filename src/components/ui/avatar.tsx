import Image from "next/image";
import { cn, initials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

/** Avatar bulat; jika avatarUrl null → tampilkan inisial. */
export function Avatar({ src, name, size = 40, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/30 font-semibold text-white",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
    >
      {src ? (
        <Image src={src} alt={name} width={size * 2} height={size * 2} className="h-full w-full object-cover" />
      ) : (
        initials(name) || "?"
      )}
    </span>
  );
}
