"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { detectInputType, type InputType } from "@/lib/detect-input";

export function useSmartInput() {
  const [text, setText] = useState("");
  const [detectedType, setDetectedType] = useState<InputType>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback((value: string) => {
    setText(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setDetectedType(detectInputType(value));
    }, 300);
  }, []);

  const clear = useCallback(() => {
    setText("");
    setDetectedType(null);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    text,
    setText: handleChange,
    detectedType,
    isAnalyzing,
    setIsAnalyzing,
    clear,
  };
}
