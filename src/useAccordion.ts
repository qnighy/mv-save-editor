import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

export type AccordionArtifacts = {
  expanded: boolean,
  expanderProps: React.ComponentPropsWithoutRef<"button"> & {
    id: string;
    "aria-expanded": boolean;
    "aria-controls": string;
    onClick: () => void;
  };
  regionProps: React.ComponentPropsWithRef<"div"> & {
    id: string,
    role: "region",
    "aria-labelledby": string,
    hidden: any,
    ref: React.RefObject<HTMLDivElement>,
  };
};
export function useAccordion(): AccordionArtifacts {
  const [expanded, setExpanded] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const headId = useId();
  const bodyId = useId();
  useEffect(() => {
    const elem = bodyRef.current;
    if (elem) {
      const handler = () => {
        setExpanded(true);
      };
      elem.addEventListener("beforematch", handler);
      return () => elem.removeEventListener("beforematch", handler);
    }
  }, []);
  const onClick = useCallback(() => setExpanded(!expanded), [expanded]);
  const expanderProps = useMemo(() => ({
    id: headId,
    "aria-expanded": expanded,
    "aria-controls": bodyId,
    onClick,
  }), [bodyId, expanded, headId, onClick])
  const regionProps = useMemo(() => ({
    id: bodyId,
    role: "region" as const,
    "aria-labelledby": headId,
    hidden: (expanded ? false : "until-found") as any,
    ref: bodyRef,
  }), [bodyId, headId, expanded])
  return {
    expanded,
    expanderProps,
    regionProps,
  };
}
