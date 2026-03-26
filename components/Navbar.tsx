"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/bus", label: "Bus" },
  { href: "/students", label: "Students" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap gap-2 px-4 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded px-3 py-1.5 text-sm ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
