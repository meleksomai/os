import { Link } from "@tanstack/react-router";

const navItems = [
  {
    title: "Essays",
    href: "/essays",
  },
  {
    title: "Research",
    href: "/papers",
  },
] as const;

export default function Navbar() {
  return (
    <nav className="z-50 flex items-baseline space-x-6 py-12 transition-opacity duration-700">
      <div>
        <Link className="font-mono" to="/">
          melek<span className="text-muted-foreground">somai </span>
        </Link>
      </div>
      {navItems.map((item) => (
        <Link
          className="group relative cursor-pointer font-medium font-sans text-foreground/80 text-sm transition-colors hover:text-foreground"
          key={item.title}
          to={item.href}
        >
          {item.title}
          <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
        </Link>
      ))}
    </nav>
  );
}
