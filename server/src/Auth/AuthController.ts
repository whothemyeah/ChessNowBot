import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';
import { prisma } from '@/lib/prisma';
import { UserProfile } from '@/generated/prisma';

// Authentication errors
export class AuthError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "AuthError";
    }
}

export class InvalidCredentialsError extends AuthError {
    constructor() {
        super("Invalid email or password");
        this.name = "InvalidCredentialsError";
    }
}

export class UserExistsError extends AuthError {
    constructor(field: string) {
        super(`User with this ${field} already exists`);
        this.name = "UserExistsError";
    }
}

// User registration interface
export interface RegisterUserData {
    email: string;
    password: string;
    fullName: string;
    username?: string;
}

// User login interface
export interface LoginUserData {
    email: string;
    password: string;
}

// JWT payload interface
export interface JwtPayload {
    userId: number;
    email: string;
}

export class AuthController {
    private readonly saltRounds = 10;
    private readonly jwtSecret: string;
    private readonly jwtExpiresIn: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || config.get<string>('auth.jwtSecret');
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || config.get<string>('auth.jwtExpiresIn');
    }

    /**
     * Register a new user
     */
    public async register(userData: RegisterUserData): Promise<{ user: UserProfile; token: string }> {
        // Check if user with this email already exists
        const existingUserByEmail = await prisma.userProfile.findUnique({
            where: { email: userData.email }
        });
        
        if (existingUserByEmail) {
            throw new UserExistsError('email');
        }

        // Check if user with this username already exists (if username provided)
        if (userData.username) {
            const existingUserByUsername = await prisma.userProfile.findUnique({
                where: { username: userData.username }
            });
            
            if (existingUserByUsername) {
                throw new UserExistsError('username');
            }
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, this.saltRounds);

        // Create the user
        const user = await prisma.userProfile.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                fullName: userData.fullName,
                username: userData.username || null,
                verified: false,
                lastLogin: new Date(),
            }
        });

        // Generate JWT token
        const token = this.generateToken(user);

        return { user, token };
    }

    /**
     * Login a user
     */
    public async login(loginData: LoginUserData): Promise<{ user: UserProfile; token: string }> {
        // Find user by email
        const user = await prisma.userProfile.findUnique({
            where: { email: loginData.email }
        });
        
        if (!user) {
            throw new InvalidCredentialsError();
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        // Update last login
        const updatedUser = await prisma.userProfile.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // Generate JWT token
        const token = this.generateToken(updatedUser);

        return { user: updatedUser, token };
    }

    /**
     * Verify JWT token
     */
    public verifyToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, this.jwtSecret) as JwtPayload;
        } catch (error) {
            throw new AuthError('Invalid or expired token');
        }
    }

    /**
     * Generate JWT token
     */
    private generateToken(user: UserProfile): string {
        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
        };

        return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
    }
}

export const authController = new AuthController();