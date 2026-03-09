import { QrForm } from "@/components/forms/qr-form";

export default function CreateQrCodePage() {
    return (
        <div className="flex flex-col space-y-6 max-w-5xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">New QR Code</h2>
                <p className="text-muted-foreground">Generate a customized QR code.</p>
            </div>
            <QrForm />
        </div>
    );
}
