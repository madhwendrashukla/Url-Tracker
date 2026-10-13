import { QrForm } from "@/components/forms/qr-form";
import { PageHeader } from "@/components/page-header";

export default function CreateQrCodePage() {
    return (
        <div className="flex max-w-5xl flex-col gap-6">
            <PageHeader title="New QR Code" description="Generate a customized QR code." />
            <QrForm />
        </div>
    );
}
