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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_1 = require("./util/mongo");
const User_schema_1 = require("./model/User.schema"); // Adjust path as needed
const bcrypt = __importStar(require("bcrypt")); // Fix import
const dotenv = __importStar(require("dotenv")); // Fix import
dotenv.config(); // Load environment variables if needed
function seedAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, mongo_1.connectMongo)();
            const adminEmail = 'admin@example.com';
            const plainPassword = 'yourAdminPassword'; // Replace with your chosen password
            const saltRounds = 10;
            const passwordHash = yield bcrypt.hash(plainPassword, saltRounds);
            const existingUser = yield User_schema_1.UserModel.findOne({ email: adminEmail });
            if (existingUser) {
                console.log(`Admin user with email ${adminEmail} already exists.`);
                return;
            }
            const adminUser = new User_schema_1.UserModel({
                email: adminEmail,
                passwordHash: passwordHash,
            });
            yield adminUser.save();
            console.log(`✅ Admin user created: ${adminEmail}`);
        }
        catch (err) {
            console.error('Error seeding admin user:', err);
        }
        finally {
            process.exit(); // Always exit
        }
    });
}
seedAdmin();
