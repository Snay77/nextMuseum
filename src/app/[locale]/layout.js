import "locomotive-scroll/dist/locomotive-scroll.css";
import "mouse-follower/dist/mouse-follower.min.css";
import "../globals.css";
import { notFound } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { getSiteUrl } from "@/app/_lib/seo";
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
  const { locale, t } = await getI18n();
  const title = t("metadata.title");
  const description = t("metadata.description");
  const socialImage = {
    url: "/opengraph-image.png",
    width: 1200,
    height: 630,
    alt: title,
  };

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: title,
      template: "%s — New Museum",
    },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "New Museum",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
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
