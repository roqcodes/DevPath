"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/lib/context/app-context";

const HEARTBEAT_MS = 30_000;
const INACTIVITY_MS = 120_000;

/** Tracks visible, active practice time; server validates via heartbeat API. */
export function usePracticeTimer(
  active: boolean,
  contextId: string,
  contextType: "problem" | "lesson" = "problem"
) {
  const { addPracticeMinutes } = useApp();
  const addPracticeMinutesRef = useRef(addPracticeMinutes);
  addPracticeMinutesRef.current = addPracticeMinutes;
  const lastActivity = useRef(Date.now());
  const accumulatedSeconds = useRef(0);
  const lastHeartbeatAt = useRef(0);
  const heartbeatInFlight = useRef(false);

  useEffect(() => {
    if (!active) return;

    const markActive = () => {
      lastActivity.current = Date.now();
    };

    window.addEventListener("pointerdown", markActive);
    window.addEventListener("keydown", markActive);

    const sendHeartbeat = () => {
      const now = Date.now();
      if (now - lastHeartbeatAt.current < HEARTBEAT_MS - 2000) return;
      const visible = !document.hidden;
      const idle = now - lastActivity.current > INACTIVITY_MS;
      if (!visible || idle || heartbeatInFlight.current) return;

      heartbeatInFlight.current = true;
      lastHeartbeatAt.current = now;

      fetch("/api/activity/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextType, contextId, visible: true }),
      })
        .then((r) => r.json())
        .then((data) => {
          const sec = Number(data.creditedSeconds) || 0;
          if (sec > 0) {
            accumulatedSeconds.current += sec;
            if (accumulatedSeconds.current >= 60) {
              const minutes = Math.floor(accumulatedSeconds.current / 60);
              accumulatedSeconds.current %= 60;
              addPracticeMinutesRef.current(minutes);
            }
          }
        })
        .catch(() => undefined)
        .finally(() => {
          heartbeatInFlight.current = false;
        });
    };

    const interval = window.setInterval(sendHeartbeat, HEARTBEAT_MS);
    sendHeartbeat();

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pointerdown", markActive);
      window.removeEventListener("keydown", markActive);
    };
  }, [active, contextId, contextType]);
}
