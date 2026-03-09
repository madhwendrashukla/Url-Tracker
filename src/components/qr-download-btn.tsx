"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function QrDownloadBtn({ id, shortCode }: { id: string, shortCode: string }) {
    const downloadPng = () => {
        const svg = document.getElementById(`qr-${id}`);
        if (!svg) return;

        // Clone the SVG so we can resize it for high-res before converting
        const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
        
        // Ensure 1024x1024 resolution
        const resolution = 1024;
        clonedSvg.setAttribute("width", resolution.toString());
        clonedSvg.setAttribute("height", resolution.toString());

        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = resolution;
            canvas.height = resolution;
            const ctx = canvas.getContext("2d");
            
            if (ctx) {
                // Background is derived from SVG anyway, but just to be safe
                ctx.drawImage(img, 0, 0, resolution, resolution);
                
                const pngUrl = canvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = pngUrl;
                a.download = `qr_${shortCode}.png`;
                a.click();
            }
            URL.revokeObjectURL(url);
        };

        img.src = url;
    };

    return (
        <Button variant="outline" size="icon" title="Download High-Res PNG" type="button" onClick={downloadPng}>
            <Download className="h-4 w-4" />
        </Button>
    )
}
