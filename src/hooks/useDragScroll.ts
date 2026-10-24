"use client";
import { useRef, useState } from "react";
/** Mouse drag scrolls the actual rail; ordinary clicks and native touch scrolling stay intact. */
export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null),
    gesture = useRef<{
      id: number;
      x: number;
      left: number;
      moved: boolean;
    } | null>(null),
    suppress = useRef(false);
  const [dragging, setDragging] = useState(false);
  const finish = (id: number) => {
    const g = gesture.current;
    if (!g || g.id !== id) return;
    if (g.moved) {
      suppress.current = true;
      setTimeout(() => {
        suppress.current = false;
        if (ref.current) delete ref.current.dataset.dragClick;
      }, 0);
    }
    if (ref.current?.hasPointerCapture(id))
      ref.current.releasePointerCapture(id);
    gesture.current = null;
    setDragging(false);
  };
  return {
    ref,
    dragging,
    handlers: {
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        suppress.current = false;
        gesture.current = {
          id: e.pointerId,
          x: e.clientX,
          left: e.currentTarget.scrollLeft,
          moved: false,
        };
      },
      onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
        const g = gesture.current;
        if (!g || g.id !== e.pointerId) return;
        const distance = e.clientX - g.x;
        if (!g.moved && Math.abs(distance) > 6) {
          g.moved = true;
          e.currentTarget.dataset.dragClick = "true";
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
        }
        if (g.moved) {
          e.preventDefault();
          e.currentTarget.scrollLeft = g.left - distance;
        }
      },
      onPointerUp: (e: React.PointerEvent<HTMLDivElement>) =>
        finish(e.pointerId),
      onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) =>
        finish(e.pointerId),
      onLostPointerCapture: (e: React.PointerEvent<HTMLDivElement>) =>
        finish(e.pointerId),
      onDragStart: (e: React.DragEvent) => e.preventDefault(),
      onClickCapture: (e: React.MouseEvent) => {
        if (suppress.current) {
          e.preventDefault();
          e.stopPropagation();
          suppress.current = false;
        }
      },
    },
  };
}
