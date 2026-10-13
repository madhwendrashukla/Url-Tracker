"use client";

import { useTransition, useState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LoginForm() {
    const [error, setError] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await login(formData);
            if (res?.error) {
                setError(res.error);
            } else {
                router.push("/dashboard");
            }
        });
    };

    return (
        <Card className="w-full gap-5 py-6 shadow-sm">
            <CardHeader className="px-6">
                <CardTitle className="text-xl font-semibold tracking-tight">Welcome back</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="px-6">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        {isPending ? "Logging in..." : "Login"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center border-0 bg-transparent px-6 pt-0 pb-6">
                <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/register" className="font-medium text-primary hover:underline">
                        Register here
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
