import { Link } from "react-router-dom";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import logo from "../assets/photos/lmslogo2.png";

export default function Footer() {
  return (
    <footer className="w-full mt-auto bg-card border-t border-border text-card-foreground">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Left */}
          <div>
            <Link to="/">
              <img
                src={logo}
                alt="LMS Logo"
                className="w-36 h-auto object-contain"
              />
            </Link>

            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Learning today, leading tomorrow. Modern courses for students,
              developers, designers and engineers to build skills for a better
              future.
            </p>
          </div>

          {/* Middle */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Learn</h3>

            <ul className="space-y-4 text-muted-foreground">
              <li>
                <Link
                  to="/homeclasses"
                  className="hover:text-primary transition"
                >
                  Browse Classes
                </Link>
              </li>

              <li>
                <a href="#" className="hover:text-primary transition">
                  Learning Paths
                </a>
              </li>

              <li>
                <Link
                  to="/about"
                  className="hover:text-primary transition"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Right */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Contact</h3>

            <div className="space-y-4 text-muted-foreground">

              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>+91 9999999999</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>samwadinfo@gmail.com</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1" />
                <span>
                  Hyderabad,
                  <br />
                  Telangana, India
                </span>
              </div>

            </div>

            {/* Social Icons */}
            <div className="flex gap-4 mt-8">

              <a
                href="#"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition"
              >
                <Github size={18} />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition"
              >
                <Twitter size={18} />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition"
              >
                <Linkedin size={18} />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition"
              >
                <Mail size={18} />
              </a>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LMS. All Rights Reserved.</p>

          <p>Built with care for learners worldwide.</p>
        </div>
      </div>
    </footer>
  );
}


// import { Link } from "react-router-dom";
// import { Github, Twitter, Linkedin, Mail } from "lucide-react";
// import logo from "../assets/photos/lmslogo2.png";

// /** Full-width footer — edge to edge, respects dark mode */
// export default function Footer() {
//   return (
//     <footer
//       id="footer"
//       className="mt-auto w-full border-t border-border bg-card text-card-foreground"
//     >
//       <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
//         <div className="col-span-2 md:col-span-1">
//           <Link to="/" className="flex items-center gap-2">
//             <img
//               src={logo}
//               alt="LMS"
//               className="w-40 h-20 object-contain"
//               // className="h-10 w-auto object-contain"
//             />
//           </Link>

//           <p className="mt-3 text-sm text-muted-foreground">
//             Learning today, leading tomorrow. Modern courses for builders,
//             designers, and engineers.
//           </p>

//           <div className="mt-4 flex items-center gap-3 text-muted-foreground">
//             <a href="#" className="hover:text-foreground" aria-label="GitHub">
//               <Github className="h-4 w-4" />
//             </a>
//             <a href="#" className="hover:text-foreground" aria-label="Twitter">
//               <Twitter className="h-4 w-4" />
//             </a>
//             <a href="#" className="hover:text-foreground" aria-label="LinkedIn">
//               <Linkedin className="h-4 w-4" />
//             </a>
//             <a href="#" className="hover:text-foreground" aria-label="Email">
//               <Mail className="h-4 w-4" />
//             </a>
//           </div>
//         </div>

//         <div>
//           <h4 className="text-sm font-semibold text-foreground">Learn</h4>
//           <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
//             <li>
//               <Link
//                 to="/homeclasses"
//                 className="hover:text-foreground hover:underline"
//               >
//                 Browse classes
//               </Link>
//             </li>
//             <li>
//               <a href="#paths" className="hover:text-foreground hover:underline">
//                 Learning paths
//               </a>
//             </li>
//             <li>
//               <a href="#teams" className="hover:text-foreground hover:underline">
//                 For teams
//               </a>
//             </li>
//             <li>
//               <a href="#pricing" className="hover:text-foreground hover:underline">
//                 Pricing
//               </a>
//             </li>
//             {/* <li>
//               <Link to="/homeclasses">Browse Classes</Link>
//             </li>

//             <li>
//               <Link to="/classes">My Classes</Link>
//             </li>

//             <li>
//               <Link to="/login">Login</Link>
//             </li> */}
//           </ul>
//         </div>

//         <div>
//           <h4 className="text-sm font-semibold text-foreground">Company</h4>
//           <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
//             <li>
//               <Link to="/about" className="hover:text-foreground hover:underline">
//                 About
//               </Link>
//             </li>
//             <li>
//               <a href="#" className="hover:text-foreground hover:underline">
//                 Careers
//               </a>
//             </li>
//             <li>
//               <a href="#" className="hover:text-foreground hover:underline">
//                 Blog
//               </a>
//             </li>
//             <li>
//               <a href="#" className="hover:text-foreground hover:underline">
//                 Contact
//               </a>
//             </li>
//           </ul>
//         </div>

//         <div>
//           <h4 className="text-sm font-semibold text-foreground">Legal</h4>
//           <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
//             <li>
//               <a href="#" className="hover:text-foreground hover:underline">
//                 Terms
//               </a>
//             </li>
//             <li>
//               <a href="#" className="hover:text-foreground hover:underline">
//                 Privacy
//               </a>
//             </li>
//             <li>
//               <a href="#" className="hover:text-foreground hover:underline">
//                 Cookies
//               </a>
//             </li>
//             <li>
//               <a href="#" className="hover:text-foreground hover:underline">
//                 DPA
//               </a>
//             </li>
//           </ul>
//         </div>
//       </div>

//       <div className="border-t border-border bg-muted/30">
//         <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
//           <p>© {new Date().getFullYear()} LMS. All rights reserved.</p>
//           <p>Built with care for learners worldwide.</p>
//         </div>
//       </div>
//     </footer>
//   );
// }
