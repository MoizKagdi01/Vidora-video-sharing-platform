import { db } from "@/db";
import { categories } from "@/db/schema";

const categoryNames = [
    
    "Gaming",
    "Anime",
    "Movies",
    "TV",
    "Food",
    "Travel",
    "Fashion",
    "Health",
    "Beauty",
    "Lifestyle",
    "Pets",
    "DIY",
    
]

async function main() {
    try {
        const values = categoryNames.map((name) => ({
            name,
            description: `Videos for ${name}`
        }));
        
        await db.insert(categories).values(values).execute();
    } catch (error) {
        console.error("error seeding categories", error);
        process.exit(1);
    }
}

main();