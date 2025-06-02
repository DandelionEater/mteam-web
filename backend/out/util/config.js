"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const envSchema = zod_1.z.object({
    DB_IP: zod_1.z.string().min(1, "DB_HOST is required"),
    DB_PORT: zod_1.z.coerce.number().default(27017),
    DB_NAME: zod_1.z.string().min(1, "DB_NAME is required"),
    EXAMPLE_DATA: zod_1.z.boolean().default(false)
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error(".env file dependencies are not met");
    console.error("Details:");
    parsedEnv.error.errors.forEach(err => {
        var _a;
        console.error(`\t${err.path.toString().padEnd(30).trimStart()} ${((_a = err.fatal) !== null && _a !== void 0 ? _a : false) ? "\x1b[33m" : "\x1b[31m"} ${err.message} \x1b[0m`);
    });
    process.exit(1);
}
exports.env = parsedEnv.data;
