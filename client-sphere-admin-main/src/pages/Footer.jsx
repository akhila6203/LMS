import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import logo from "../assets/photos/logo.png";

/** Full-width footer — edge to edge, respects dark mode */
export default function Footer() {
  return (
    <footer
      id="footer"
      className="mt-auto w-full border-t border-border bg-card text-card-foreground"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="LMS"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <p className="mt-3 text-sm text-muted-foreground">
            Learning today, leading tomorrow. Modern courses for builders,
            designers, and engineers.
          </p>

          <div className="mt-4 flex items-center gap-3 text-muted-foreground">
            <a href="#" className="hover:text-foreground" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-foreground" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-foreground" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-foreground" aria-label="Email">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Learn</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                to="/homeclasses"
                className="hover:text-foreground hover:underline"
              >
                Browse classes
              </Link>
            </li>
            <li>
              <a href="#paths" className="hover:text-foreground hover:underline">
                Learning paths
              </a>
            </li>
            <li>
              <a href="#teams" className="hover:text-foreground hover:underline">
                For teams
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-foreground hover:underline">
                Pricing
              </a>
            </li>
            {/* <li>
              <Link to="/homeclasses">Browse Classes</Link>
            </li>

            <li>
              <Link to="/classes">My Classes</Link>
            </li>

            <li>
              <Link to="/login">Login</Link>
            </li> */}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground hover:underline">
                About
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-foreground hover:underline">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground hover:underline">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#" className="hover:text-foreground hover:underline">
                Terms
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground hover:underline">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground hover:underline">
                Cookies
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground hover:underline">
                DPA
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border bg-muted/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} LMS. All rights reserved.</p>
          <p>Built with care for learners worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
