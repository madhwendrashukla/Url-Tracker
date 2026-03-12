"use client";

import { useEffect, useState } from "react";

export function LocalTime({ date }: { date: string | Date }) {
    const [localTime, setLocalTime] = useState<string>("");

    useEffect(() => {
        setLocalTime(new Date(date).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }));
    }, [date]);

    // Prevents server-side hydration mismatches by rendering empty string first
    if (!localTime) {
        return <span className="opacity-0">Loading...</span>;
    }

    return <span>{localTime}</span>;
}
