import "lenis/dist/lenis.css";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Footer from "./components/footer";
import Header from "./components/header";
import SmoothScroll from "./components/smoothScroll";
import Template from "./components/template";

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
    <html lang="fr" data-scroll-behavior="smooth">
      <body>
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
