"use client";

import type { KeyboardEvent, ReactNode } from "react";

export function RoomEnterToSend({ children }: { children: ReactNode }) {
  function submitOnEnter(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) return;
    event.preventDefault();
    target.form?.requestSubmit();
  }

  return <div onKeyDown={submitOnEnter}>{children}</div>;
}
