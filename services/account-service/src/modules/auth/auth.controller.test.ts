import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { register, login } from "./auth.controller";
import { AppDataSource } from "../../config/db";

/**
 * Mock database layer – we do NOT touch real DB in unit tests
 */
jest.mock("../../config/db", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

/**
 * Mock crypto & token libraries
 */
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

/**
 * Helper for mocking Express response object
 */
function mockResponse(): Response {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("Auth Controller", () => {
  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";
  });

  // =========================
  // REGISTER
  // =========================

  it("register: returns 400 if username or password is missing", async () => {
    const req = { body: {} } as Request;
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Username and password required",
    });
  });

  it("register: returns 409 if user already exists", async () => {
    mockRepo.findOne.mockResolvedValue({ id: 1 });

    const req = {
      body: { username: "test", password: "123" },
    } as Request;
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "User already exists",
    });
  });

  it("register: creates user and returns 201", async () => {
    mockRepo.findOne.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

    mockRepo.create.mockReturnValue({
      id: 1,
      username: "test",
      role: "User",
    });

    const req = {
      body: {
        username: "test",
        password: "123",
        role: "User",
      },
    } as Request;
    const res = mockResponse();

    await register(req, res);

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      username: "test",
      role: "User",
    });
  });

  // =========================
  // LOGIN
  // =========================

  it("login: returns 400 if credentials are missing", async () => {
    const req = { body: {} } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Username and password required",
    });
  });

  it("login: returns 401 if user does not exist", async () => {
    mockRepo.findOne.mockResolvedValue(null);

    const req = {
      body: { username: "test", password: "123" },
    } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid credentials",
    });
  });

  it("login: returns 401 if password is invalid", async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      username: "test",
      password: "hashed",
      role: "User",
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const req = {
      body: { username: "test", password: "wrong" },
    } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid credentials",
    });
  });

  it("login: returns JWT token for valid credentials", async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      username: "test",
      password: "hashed",
      role: "User",
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("jwt-token");

    const req = {
      body: { username: "test", password: "123" },
    } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(jwt.sign).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      token: "jwt-token",
    });
  });
});
