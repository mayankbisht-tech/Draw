"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const _db_1 = require("@db");
const router = express_1.default.Router();
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, email, password } = req.body;
    try {
        const existingUser = yield _db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser)
            return res.status(400).json({ error: "User already exists" });
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield _db_1.prisma.user.create({
            data: {
                firstname,
                lastname,
                email,
                password: hashedPassword,
            },
        });
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret)
            throw new Error("JWT_SECRET not defined");
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });
        res.status(201).json({ message: "User registered successfully", token });
    }
    catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield _db_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: "Invalid credentials" });
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret)
            throw new Error("JWT_SECRET not defined");
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });
        res.status(200).json({ message: "Login successful", token });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
