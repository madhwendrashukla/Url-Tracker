"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const linkSchema = z.object({
    originalUrl: z.string().url("Must be a valid URL"),
    customSlug: z.string().optional(),
});

export async function createLink(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const data = Object.fromEntries(formData);
    const validated = linkSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Invalid fields", details: validated.error.flatten().fieldErrors };
    }

    const { originalUrl, customSlug } = validated.data;

    const shortCode = crypto.randomUUID().split("-")[0];
    const finalSlug = customSlug || shortCode;

    try {
        const existing = await prisma.link.findFirst({
            where: { customSlug: finalSlug }
        });

        if (existing) {
            return { error: "Custom slug is already in use." };
        }

        await prisma.link.create({
            data: {
                userId: session.user.id,
                originalUrl,
                shortCode,
                customSlug: finalSlug,
            }
        });

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { error: "Failed to create link" };
    }
}

export async function deleteLink(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const link = await prisma.link.findUnique({ where: { id } });
        if (!link || link.userId !== session.user.id) {
            return { error: "Not found or unauthorized" };
        }

        await prisma.link.delete({ where: { id } });
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete" };
    }
}
