"use client";

import NextLink from "next/link";
import { useStore } from "../_lib/store";

export default function Link({ href, children, ...props }) {
  const { setDestinationUrl, setIsTransitionActive } = useStore();

  return (
    <NextLink
      href={href}
      {...props}
      onClick={(e) => {
        e.preventDefault();
        setDestinationUrl(href);
        setIsTransitionActive(true);
      }}
    >
      {children}
    </NextLink>
  );
}
