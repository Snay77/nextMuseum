import "locomotive-scroll/dist/locomotive-scroll.css";
import "mouse-follower/dist/mouse-follower.min.css";
import "../globals.css";
import { notFound } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import FavoriteSync from "@/app/components/favorites/FavoriteSync";
import Footer from "@/app/components/layout/Footer";
import Header from "@/app/components/layout/Header";
import SmoothScroll from "@/app/components/layout/SmoothScroll";
import Template from "@/app/components/layout/Template";
import MuseumCursor from "@/app/components/ui/MuseumCursor";
import { isSupportedLocale, SUPPORTED_LOCALES } from "@/app/i18n/config";
import I18nProvider from "@/app/i18n/I18nProvider";
import { getDictionary, getI18n } from "@/app/i18n/server";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata() {
  const { t } = await getI18n();

  return {
    title: {
      default: t("metadata.title"),
      template: "%s — New Museum",
    },
    description: t("metadata.description"),
  };
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const dictionary = await getDictionary(locale);

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className="has-museum-cursor"
    >
      <body className="has-museum-cursor">
        <I18nProvider locale={locale} dictionary={dictionary}>
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
        </I18nProvider>
      </body>
    </html>
  );
}
