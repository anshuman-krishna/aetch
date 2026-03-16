import Link from 'next/link';

const footerLinks = {
  Platform: [
    { href: '/app/gallery', label: 'Gallery' },
    { href: '/app/artists', label: 'Artists' },
    { href: '/app/shops', label: 'Shops' },
    { href: '/app/feed', label: 'Feed' },
  ],
  Company: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/careers', label: 'Careers' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-surface/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">AETCH</h3>
            <p className="mt-2 text-sm text-muted">The tattoo creative platform.</p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground">{category}</h4>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} AETCH. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
