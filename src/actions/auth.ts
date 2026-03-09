"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function login(formData: FormData) {
    try {
        const data = Object.fromEntries(formData);
        await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirectTo: "/dashboard",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials." };
                default:
                    return { error: "Something went wrong." };
            }
        }
        throw error;
    }
}

export async function register(formData: FormData) {
    try {
        const rawData = Object.fromEntries(formData);
        const validatedFields = registerSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors };
        }

        const { email, password, name } = validatedFields.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "User already exists with that email" };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });

        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard",
        });

    } catch (error) {
        if (error instanceof AuthError) {
            return { error: "Something went wrong during sign in." };
        }
        throw error;
    }
}

export async function logout() {
    await signOut({ redirectTo: "/login" });
}
