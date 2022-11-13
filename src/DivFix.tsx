import React, { useEffect, useMemo, useRef } from "react";

export type DivFixProps = Omit<React.ComponentPropsWithoutRef<"div">, "hidden"> & {
  hidden?: boolean | string | undefined;
};
export const DivFix = React.forwardRef<HTMLDivElement, DivFixProps>((props, forwardedRef) => {
  const { hidden } = props;
  const ref = useRef<HTMLDivElement>(null);
  const mergedRef = useMemo<React.Ref<HTMLDivElement>>(() => {
    return (current) => {
      if (typeof forwardedRef === "function") {
        forwardedRef(current);
      } else if (forwardedRef) {
        forwardedRef.current = current;
      }
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = current;
    };
  }, [forwardedRef, ref]);
  useEffect(() => {
    const elem = ref.current;
    if (elem) {
      if (elem.hidden === true && typeof hidden === "string") {
        (elem as any).hidden = hidden;
      }
    }
  });
  return <div {...props as React.ComponentPropsWithoutRef<"div">} ref={mergedRef} />;
});
