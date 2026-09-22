import "locomotive-scroll/dist/locomotive-scroll.css";
import "mouse-follower/dist/mouse-follower.min.css";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import FavoriteSync from "./components/favorites/FavoriteSync";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import SmoothScroll from "./components/layout/SmoothScroll";
import Template from "./components/layout/Template";
import MuseumCursor from "./components/ui/MuseumCursor";

export const metadata = {
  title: {
    default: "New Museum — Art moderne & contemporain",
    template: "%s — New Museum",
  },
  description:
    "Une collection vivante d'art moderne et contemporain. Découvrez les œuvres, les artistes et préparez votre visite.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className="has-museum-cursor">
      <body className="has-museum-cursor">
        <MuseumCursor />
        <FavoriteSync />
        <SmoothScroll>
          <NuqsAdapter>
            <Template>
              <Header />
              {children}
              <Footer />
            </Template>
          </NuqsAdapter>
        </SmoothScroll>
      </body>
    </html>
  );
}
