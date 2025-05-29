import { z } from "zod"
import dotenv from "dotenv"

dotenv.config()

const envSchema = z.object({
	DB_IP: z.string().min(1, "DB_HOST is required"),
	DB_PORT: z.coerce.number().default(27017),
	DB_NAME: z.string().min(1, "DB_NAME is required"),
	EXAMPLE_DATA: z.boolean().default(false)
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
	
	console.error(".env file dependencies are not met");
	console.error("Details:");
	parsedEnv.error.errors.forEach(err => {
		console.error(`\t${err.path.toString().padEnd(30).trimStart()} ${(err.fatal ?? false) ? "\x1b[33m" : "\x1b[31m"} ${err.message} \x1b[0m`)
	});
	process.exit(1);
}

export const env = parsedEnv.data;