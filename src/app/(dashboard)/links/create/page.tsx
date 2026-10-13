import { LinkForm } from "@/components/forms/link-form";
import { PageHeader } from "@/components/page-header";

export default function CreateLinkPage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="New Short Link" description="Shorten a URL and customize its appearance." />
            <LinkForm />
        </div>
    );
}
