"use client";

import { useEffect } from "react";
import MainWidget from "@/components/MainWidget";
import { initializeSettings } from "@/lib/settings";

export default function Home() {
  useEffect(() => {
    initializeSettings();
  }, []);

  return <MainWidget />;
}
