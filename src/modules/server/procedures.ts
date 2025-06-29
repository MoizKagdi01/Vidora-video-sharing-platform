import { db } from "@/db";
import { categories } from "@/db/schema";
import { router, baseProcedure } from "../../trpc/init";
import { TRPCError } from "@trpc/server";

export const categoriesRouter = router({
    getAll: baseProcedure.query(async () => {
        try {
            const data = await db.select().from(categories);
            if (!data) return [];
            return data;
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch categories",
                cause: error
            });
        }
    })
})
