import React, { useEffect, useId, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import './Accordion.css';

export type AccordionProps = {
  head?: React.ReactNode | undefined;
  children?: React.ReactNode | undefined;
};
export function Accordion(props: AccordionProps): React.ReactElement | null {
  const { head, children } = props;
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
  useEffect(() => {
    const elem = bodyRef.current;
    if (elem) {
      if (elem.hidden === true) {
        (elem as any).hidden = "until-found";
      }
    }
  }, [expanded]);
  return (
    <>
      <button
        id={headId}
        className="accordion-expander"
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={() => setExpanded(!expanded)}
      >
        <FontAwesomeIcon icon={expanded ? solid("chevron-down") : solid("chevron-right")} />
        {head}
      </button>
      <div
        id={bodyId}
        role="region"
        aria-labelledby={headId}
        hidden={(expanded ? false : "until-found") as any}
        ref={bodyRef}
      >
        {children}
      </div>
    </>
  );
}
