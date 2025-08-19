"use client";
import { useEffect } from "react";
import { useHeadstoneStore } from "#/lib/headstone-store";

export default function ShapeHydrator({ url }: { url: string }) {
  const { setShapeUrl } = useHeadstoneStore();
  useEffect(() => {
    setShapeUrl(url);
  }, [url, setShapeUrl]);
  return null;
}
