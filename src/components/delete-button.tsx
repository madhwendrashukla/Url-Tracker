"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" variant="destructive" size="icon" title="Delete" disabled={pending}>
            {pending ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </Button>
    );
}
