// app/components/layout/sidebar.tsx
// Server Component

import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Projects", icon: "📁" },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="text-sm font-semibold text-gray-900">AI Estimator</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200 px-4 py-3">
        <p className="text-xs text-gray-400">AI Task Estimator v1</p>
      </div>
    </aside>
  );
}
