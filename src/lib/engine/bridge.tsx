"use client";

/**
 * Owner: Agent S (Data). Mounted once. Hooks the engine into persistence
 * (localStorage always; Supabase sync when configured) and fires `app_opened`.
 */

import { useEffect } from "react";
import { dispatchEngine } from "./store";

export function EngineBridge() {
  useEffect(() => {
    dispatchEngine({ type: "app_opened" });
  }, []);
  return null;
}
