import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-header";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const { user } = session;
    const initials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Profile" description="Manage your account settings and preferences." />

            <div className="grid gap-6">
                <Card className="gap-0 py-0">
                    <CardHeader className="border-b py-4">
                        <CardTitle className="font-semibold">Account Information</CardTitle>
                        <CardDescription>Your personal information registered with us.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 py-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20 ring-4 ring-accent">
                                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-2xl font-semibold leading-none tracking-tight">{user.name}</h3>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
