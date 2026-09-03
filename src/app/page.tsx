"use client";

import MainWidget from "@/components/MainWidget";
import { initializeSettings } from "@/lib/settings";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    initializeSettings();
  }, []);

  return <MainWidget />;
}