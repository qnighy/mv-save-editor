import React, { useEffect, useMemo, useRef, useState } from "react";

type DownloadLinkProps = React.ComponentPropsWithoutRef<"a"> & {
  blob: Blob;
};
export const DownloadLink = React.forwardRef<HTMLAnchorElement, DownloadLinkProps>((props, forwardedRef) => {
  const { blob, ...rest } = props;
  const ref = useRef<HTMLAnchorElement>(null);
  const mergedRef = useMemo<React.Ref<HTMLAnchorElement>>(() => {
    return (current) => {
      if (typeof forwardedRef === "function") {
        forwardedRef(current);
      } else if (forwardedRef) {
        forwardedRef.current = current;
      }
      (ref as React.MutableRefObject<HTMLAnchorElement | null>).current = current;
    };
  }, [forwardedRef, ref]);
  const [href, setHref] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!URL.createObjectURL) {
      return;
    }
    const url = URL.createObjectURL(blob);
    setHref(url);
    return () => {
      setHref(undefined);
      URL.revokeObjectURL(url);
    };
  }, [blob]);
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return <a
    download="data"
    {...rest}
    href={href}
    ref={mergedRef}
  />;
});
