"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const qrSchema = z.object({
    name: z.string().min(1, "Name is required"),
    destinationUrl: z.string().url("Must be a valid URL"),
    fgColor: z.string().default("#000000"),
    bgColor: z.string().default("#ffffff"),
});

export async function createQrCode(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const data = Object.fromEntries(formData);
    const validated = qrSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Invalid fields", details: validated.error.flatten().fieldErrors };
    }

    const { name, destinationUrl, fgColor, bgColor } = validated.data;

    const shortCode = crypto.randomUUID().split("-")[0];
    const customizedSettings = JSON.stringify({ fgColor, bgColor });

    try {
        await prisma.qRCode.create({
            data: {
                userId: session.user.id,
                name,
                destinationUrl,
                shortCode,
                customizedSettings,
            }
        });

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { error: "Failed to create QR code" };
    }
}

export async function deleteQrCode(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const qr = await prisma.qRCode.findUnique({ where: { id } });
        if (!qr || qr.userId !== session.user.id) {
            return { error: "Not found or unauthorized" };
        }

        await prisma.qRCode.delete({ where: { id } });
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete" };
    }
}
