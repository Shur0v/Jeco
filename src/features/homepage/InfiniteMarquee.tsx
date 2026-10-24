"use client";

import { useEffect, useRef, useState } from "react";

export function InfiniteMarquee({
  messages,
  speed,
  direction,
}: {
  messages: string[];
  speed: number;
  direction: "left" | "right";
}) {
  const container = useRef<HTMLDivElement>(null);
  const sequence = useRef<HTMLDivElement>(null);
  const [repeats, setRepeats] = useState(4);

  useEffect(() => {
    const resize = () => {
      const width = sequence.current?.getBoundingClientRect().width || 0;
      if (width > 0 && container.current)
        setRepeats(Math.max(1, Math.ceil(container.current.clientWidth / width)));
    };
    const observer = new ResizeObserver(resize);
    if (container.current) observer.observe(container.current);
    if (sequence.current) observer.observe(sequence.current);
    resize();
    // Font metrics can change after the initial layout.
    void document.fonts.ready.then(resize);
    return () => observer.disconnect();
  }, [messages]);

  return (
    <div className="managed-marquee" ref={container} tabIndex={0} aria-label="Our jewellery values">
      <div style={{ animationDuration: `${speed}s`, animationDirection: direction === "right" ? "reverse" : "normal" }}>
        {[0, 1].map((copy) => (
          <div className="marquee-copy" key={copy} aria-hidden={copy === 1}>
            {Array.from({ length: repeats }, (_, repeat) => (
              <div className="marquee-sequence" key={repeat} ref={copy === 0 && repeat === 0 ? sequence : undefined} aria-hidden={repeat > 0 || copy === 1}>
                {messages.map((text, index) => <span key={index}>{text}</span>)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
