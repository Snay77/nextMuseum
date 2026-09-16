import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Header from "./components/header";
import Template from "./components/template";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <NuqsAdapter>
          <Template>
            <Header />
            {children}
          </Template>
        </NuqsAdapter>
      </body>
    </html>
  );
}