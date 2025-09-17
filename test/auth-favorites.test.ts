/**
 * @file tests/auth-favorites.test.ts
 * Test end-to-end de autenticación + favoritos usando Jest + Supertest
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import type { NextApiHandler } from "next";
import http from "http";

// Importamos los handlers directamente
import registerHandler from "../src/app/api/auth/register/route";
import loginHandler from "../src/app/api/auth/login/route";
import meHandler from "../src/app/api/auth/me/route";
import favIndexHandler from "../src/app/api/favoritos/route";
import favIdHandler from "../src/app/api/favoritos/[id]/route";

// Helper para convertir un NextApiHandler en un servidor HTTP compatible con supertest
function handlerToServer(handler: NextApiHandler) {
  return http.createServer((req, res) => {
    // @ts-ignore: forzar compatibilidad con NextApiHandler
    handler(req, res);
  });
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = "secret_test";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.COOKIE_NAME = "sesion_test";
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("Auth + Favoritos API", () => {
  let cookie: string;

  it("registra un usuario", async () => {
    const server = handlerToServer(registerHandler);
    const res = await request(server)
      .post("/")
      .send({ email: "test@example.com", password: "password123", name: "Tester" });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("test@example.com");
    cookie = res.headers["set-cookie"][0];
  });

  it("hace login del usuario", async () => {
    const server = handlerToServer(loginHandler);
    const res = await request(server)
      .post("/")
      .send({ email: "test@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("test@example.com");
    cookie = res.headers["set-cookie"][0];
  });

  it("obtiene usuario autenticado con /me", async () => {
    const server = handlerToServer(meHandler);
    const res = await request(server).get("/").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("test@example.com");
  });

  let favId: string;

  it("agrega un favorito", async () => {
    const server = handlerToServer(favIndexHandler);
    const res = await request(server)
      .post("/")
      .set("Cookie", cookie)
      .send({ bookId: "book123" });

    expect(res.status).toBe(201);
    expect(res.body.fav.bookId).toBe("book123");
    favId = res.body.fav._id;
  });

  it("lista favoritos", async () => {
    const server = handlerToServer(favIndexHandler);
    const res = await request(server).get("/").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.favorites).toHaveLength(1);
    expect(res.body.favorites[0].bookId).toBe("book123");
  });

  it("elimina un favorito", async () => {
    const server = handlerToServer(favIdHandler);
    const res = await request(server)
      .delete(`/${favId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Favorite removed");
  });
});
