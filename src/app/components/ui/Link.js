"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "../../_lib/store";
import { useI18n } from "../../i18n/I18nProvider";
import { localizeHref, stripLocaleFromPathname } from "../../i18n/routing";

export default function Link({ href, children, onClick, ...props }) {
  const pathname = usePathname();
  const { locale } = useI18n();
  const localizedHref = localizeHref(href, locale);
  const routePathname = stripLocaleFromPathname(pathname);
  const isTransitionActive = useStore((state) => state.isTransitionActive);
  const setDestinationUrl = useStore((state) => state.setDestinationUrl);
  const setTransitionType = useStore((state) => state.setTransitionType);
  const setIsTransitionActive = useStore(
    (state) => state.setIsTransitionActive,
  );

  return (
    <NextLink
      href={localizedHref}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || typeof localizedHref !== "string") return;

        const isModifiedClick =
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
        const target = new URL(localizedHref, window.location.href);
        const isSameDocumentAnchor =
          target.pathname === pathname && Boolean(target.hash);
        const isImmersiveNavigation =
          stripLocaleFromPathname(target.pathname) === "/singularity" ||
          routePathname === "/singularity";

        if (
          isModifiedClick ||
          props.target === "_blank" ||
          target.origin !== window.location.origin ||
          isSameDocumentAnchor ||
          isImmersiveNavigation
        ) {
          return;
        }

        event.preventDefault();

        if (isTransitionActive || target.pathname === pathname) return;

        setTransitionType("default");
        setDestinationUrl(localizedHref);
        setIsTransitionActive(true);
      }}
    >
      {children}
    </NextLink>
  );
}
