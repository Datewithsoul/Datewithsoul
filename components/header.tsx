"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Heart } from "lucide-react";

const navLinks = [
  { href: "#classes", label: "คลาสทั้งหมด" },
  { href: "#schedule", label: "ตารางคลาส" },
  { href: "#how-to-book", label: "วิธีจอง" },
  { href: "#contact", label: "ติดต่อ" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 bg-white"
      style={{ borderBottom: "var(--pop-outline)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "var(--brand-yellow)",
                border: "var(--pop-outline)",
                boxShadow: "2px 2px 0px var(--brand-brown)",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
            >
              <Heart
                className="w-4 h-4"
                style={{ color: "var(--brand-brown)" }}
                fill="currentColor"
              />
            </div>
            <span
              className="font-black text-lg leading-tight tracking-tight"
              style={{ color: "var(--brand-brown)" }}
            >
              Date with{" "}
              <span style={{ color: "var(--brand-red)" }}>Soul Love</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                style={{ color: "var(--brand-brown)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--brand-yellow)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="#schedule"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm pop-btn-primary"
            >
              จองคลาส
            </Link>
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: "var(--brand-brown)" }}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden bg-white px-4 pb-4"
          style={{ borderTop: "var(--pop-outline)" }}
        >
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg font-semibold transition-colors"
                style={{ color: "var(--brand-brown)" }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#schedule"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center px-5 py-3 rounded-full pop-btn-primary"
            >
              จองคลาส
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
