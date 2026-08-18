import { Link } from "@tanstack/react-router";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-4 md:px-8">
        <div>
          <p className="font-serif text-2xl italic text-foreground">Amanda Florida</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cleaning, curated. A network of pros — one honest platform.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Product</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/services" className="hover:underline">
                Services
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:underline">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/cleaners" className="hover:underline">
                Our cleaners
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:underline">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/become-a-cleaner" className="hover:underline">
                Work with us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Legal</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/privacy" className="hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:underline">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:underline">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-muted-foreground md:px-8">
          <p>© {year} Amanda Florida. All rights reserved.</p>
          <p>Made with care in Tampa, FL</p>
        </div>
      </div>
    </footer>
  );
}
