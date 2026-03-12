"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface AnalyticsFilterProps {
    currentFilter: string;
    qrCodes: { id: string; name: string }[];
    links: { id: string; name: string; customSlug: string | null; originalUrl: string }[];
}

export function AnalyticsFilter({ currentFilter, qrCodes, links }: AnalyticsFilterProps) {
    const router = useRouter();

    const handleValueChange = (value: string | null) => {
        if (value) router.push(`/analytics?filter=${value}`);
    };

    return (
        <Select value={currentFilter} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="All Links & QR Codes" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Links & QR Codes</SelectItem>
                {qrCodes.length > 0 && (
                    <SelectGroup>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">QR Codes</div>
                        {qrCodes.map((qr) => (
                            <SelectItem key={qr.id} value={`qr_${qr.id}`}>
                                QR: {qr.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                )}
                {links.length > 0 && (
                    <SelectGroup>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Short Links</div>
                        {links.map((link) => (
                            <SelectItem key={link.id} value={`link_${link.id}`}>
                                Link: {link.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                )}
            </SelectContent>
        </Select>
    );
}
