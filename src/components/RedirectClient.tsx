"use client";

import { useEffect } from "react";

interface RedirectClientProps {
    destination: string;
    trackUrl: string;
}

export default function RedirectClient({ destination, trackUrl }: RedirectClientProps) {

    useEffect(() => {
        // Fire tracking in background (non-blocking)
        fetch(trackUrl, { method: "GET", keepalive: true }).catch(() => {});

        // Small delay so the spinner is visible, then redirect
        const timer = setTimeout(() => {
            window.location.replace(destination);
        }, 800);

        return () => clearTimeout(timer);
    }, [destination, trackUrl]);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            gap: "24px",
        }}>
            {/* Spinner */}
            <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                border: "4px solid rgba(99, 102, 241, 0.2)",
                borderTopColor: "#6366f1",
                animation: "spin 0.8s linear infinite",
            }} />

            <div style={{ textAlign: "center", color: "#e2e8f0" }}>
                <p style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    margin: "0 0 8px 0",
                    background: "linear-gradient(90deg, #6366f1, #a855f7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}>
                    Redirecting you...
                </p>
                <p style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    margin: 0,
                }}>
                    Please wait a moment
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
