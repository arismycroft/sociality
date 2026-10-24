"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { SearchBox } from "./search-box";
import { useAppSelector } from "@/store";

export function Navbar() {
  const { user, token, hydrated } = useAppSelector((s) => s.auth);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const loggedIn = !!token && !!user;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-black">
      {/* Desktop */}
      <div className="mx-auto hidden h-16 max-w-[1200px] grid-cols-[1fr_minmax(0,480px)_1fr] items-center gap-6 px-6 md:grid">
        <Logo />
        <SearchBox />
        <div className="flex items-center justify-end gap-3">
          {!hydrated ? null : loggedIn ? (
            <Link href="/me" className="flex items-center gap-3">
              <Avatar src={user.avatarUrl} name={user.name} size={40} />
              <span className="text-sm font-semibold">{user.name}</span>
            </Link>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex h-16 items-center justify-between px-4 md:hidden">
        <Logo />
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search size={22} />
          </button>
          {!hydrated ? null : loggedIn ? (
            <Link href="/me" aria-label="My profile">
              <Avatar src={user.avatarUrl} name={user.name} size={40} />
            </Link>
          ) : (
            <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {menuOpen && !loggedIn && (
        <div className="grid grid-cols-2 gap-3 border-t border-border px-4 py-3 md:hidden">
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      )}

      {searchOpen && <SearchBox variant="overlay" onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
