"use client";

import { useTransition, useState } from "react";
import { register } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RegisterForm() {
    const [error, setError] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await register(formData);
            if (res?.error) {
                setError(res.error);
            } else {
                router.push("/dashboard");
            }
        });
    };

    return (
        <Card className="w-full gap-6 bg-transparent py-0 ring-0">
            <CardHeader className="px-0">
                <CardTitle className="text-2xl font-semibold tracking-tight">Create an account</CardTitle>
                <CardDescription>Enter your details to get started</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="John Doe" required disabled={isPending} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isPending} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required disabled={isPending} />
                    </div>
                    {error && <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</div>}
                    <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                        {isPending ? "Registering..." : "Register"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-start border-0 bg-transparent px-0 pt-0">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Login here
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
