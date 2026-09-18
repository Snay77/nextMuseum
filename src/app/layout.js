import "locomotive-scroll/dist/locomotive-scroll.css";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import SmoothScroll from "./components/layout/SmoothScroll";
import Template from "./components/layout/Template";

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
