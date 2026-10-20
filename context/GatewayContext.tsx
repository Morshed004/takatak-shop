"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface GatewayContextType {
  apiKey: string;
  apiUrl: string;
  setGatewayConfig: (key: string, url: string) => void;
  isConfigured: boolean;
}

const GatewayContext = createContext<GatewayContextType | undefined>(undefined);

export function GatewayProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("");

  // কম্পোনেন্ট লোড হওয়ার পর sessionStorage থেকে মান রিড করা
  useEffect(() => {
    const savedKey = sessionStorage.getItem("GATEWAY_API_KEY") || "";
    const savedUrl = sessionStorage.getItem("GATEWAY_API_URL") || "";
    setApiKey(savedKey);
    setApiUrl(savedUrl);
  }, []);

  // মান আপডেট এবং sessionStorage এ সেভ করার ফাংশন
  const setGatewayConfig = (key: string, url: string) => {
    setApiKey(key);
    setApiUrl(url);
    sessionStorage.setItem("GATEWAY_API_KEY", key);
    sessionStorage.setItem("GATEWAY_API_URL", url);
  };

  const isConfigured = Boolean(apiKey && apiUrl);

  return (
    <GatewayContext.Provider value={{ apiKey, apiUrl, setGatewayConfig, isConfigured }}>
      {children}
    </GatewayContext.Provider>
  );
}

export function useGateway() {
  const context = useContext(GatewayContext);
  if (!context) {
    throw new Error("useGateway must be used within a GatewayProvider");
  }
  return context;
}