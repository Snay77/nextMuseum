"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "../_lib/store";

export default function Link({ href, children, onClick, ...props }) {
  const pathname = usePathname();
  const isTransitionActive = useStore((state) => state.isTransitionActive);
  const setDestinationUrl = useStore((state) => state.setDestinationUrl);
  const setIsTransitionActive = useStore(
    (state) => state.setIsTransitionActive,
  );

  return (
    <NextLink
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || typeof href !== "string") return;

        const isModifiedClick =
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
        const target = new URL(href, window.location.href);
        const isSameDocumentAnchor =
          target.pathname === pathname && Boolean(target.hash);

        if (
          isModifiedClick ||
          props.target === "_blank" ||
          target.origin !== window.location.origin ||
          isSameDocumentAnchor
        ) {
          return;
        }

        event.preventDefault();

        if (isTransitionActive || target.pathname === pathname) return;

        setDestinationUrl(href);
        setIsTransitionActive(true);
      }}
    >
      {children}
    </NextLink>
  );
}
