import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import ms from "ms";
import { AppDataSource } from "../../config/db";
import { User } from "../../entities/User";

//Creates a new user account. Password is hashed before storage.
 
export async function register(req: Request, res: Response) {
  try {
    const { username, password, role } = req.body;

    // Basic input validation
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const userRepo = AppDataSource.getRepository(User);

    // Ensure username uniqueness
    const existing = await userRepo.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password before persisting
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user entity
    const user = userRepo.create({
      username,
      password: hashedPassword,
      role: role === "GameMaster" ? "GameMaster" : "User",
    });

    await userRepo.save(user);

    // Return public user data only (no password)
    return res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Authenticates user via username/password and issues a signed JWT token.

/*JWT payload contains:
    userId: used by other services for ownership checks
    role: used for authorization (User / GameMaster)
*/
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // Validate credentials input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const userRepo = AppDataSource.getRepository(User);

    // Lookup user by username
    const user = await userRepo.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password hash
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // JWT secret must be shared with other services for verification
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    // JWT payload shared across microservices
    const payload = {
      userId: user.id,
      role: user.role,
    };

    // Convert expiration from env (e.g. "1h") to seconds
    let expiresIn: number | undefined;
    if (process.env.JWT_EXPIRES_IN) {
      const msValue = ms(process.env.JWT_EXPIRES_IN as ms.StringValue);
      expiresIn = msValue ? Math.floor(msValue / 1000) : undefined;
    }

    const options: SignOptions = { expiresIn };

    // Issue signed JWT token
    const token = jwt.sign(payload, secret, options);

    // Client uses token as: Authorization: Bearer <token>
    return res.json({ token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
