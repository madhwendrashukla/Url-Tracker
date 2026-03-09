import { LinkForm } from "@/components/forms/link-form";

export default function CreateLinkPage() {
    return (
        <div className="flex flex-col space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">New Short Link</h2>
                <p className="text-muted-foreground">Shorten a URL and customize its appearance.</p>
            </div>
            <LinkForm />
        </div>
    );
}
