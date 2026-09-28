import { createServer, IncomingMessage, ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import type { ApiError, Gender, User, UserInput, UserStatus } from "./types";

const AUTHORIZATION = "Bearer portfolio-token";

export class MockApiServer {
  private readonly users = new Map<number, User>();
  private nextId = 3;
  private server = createServer(this.handleRequest.bind(this));

  baseUrl = "";

  async start(): Promise<void> {
    this.reset();
    await new Promise<void>((resolve) => this.server.listen(0, "127.0.0.1", resolve));
    const address = this.server.address() as AddressInfo;
    this.baseUrl = `http://127.0.0.1:${address.port}`;
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve, reject) =>
      this.server.close((error) => (error ? reject(error) : resolve())),
    );
  }

  reset(): void {
    this.users.clear();
    this.users.set(1, {
      id: 1,
      name: "Ada Lovelace",
      gender: "female",
      email: "ada@example.test",
      status: "active",
    });
    this.users.set(2, {
      id: 2,
      name: "Alan Turing",
      gender: "male",
      email: "alan@example.test",
      status: "inactive",
    });
    this.nextId = 3;
  }

  private async handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const url = new URL(request.url ?? "/", this.baseUrl);
    const segments = url.pathname.split("/").filter(Boolean);

    if (segments[0] !== "users") {
      return this.send(response, 404, { message: "Resource not found" });
    }

    const id = segments[1] ? Number(segments[1]) : undefined;
    const method = request.method ?? "GET";

    if (method === "GET" && id === undefined) return this.listUsers(url, response);
    if (method === "GET" && id !== undefined) return this.getUser(id, response);

    if (request.headers.authorization !== AUTHORIZATION) {
      return this.send(response, 401, { message: "Invalid token" });
    }

    if (method === "POST" && id === undefined) {
      return this.createUser(await this.readBody(request), response);
    }
    if ((method === "PUT" || method === "PATCH") && id !== undefined) {
      return this.updateUser(id, await this.readBody(request), method === "PUT", response);
    }
    if (method === "DELETE" && id !== undefined) return this.deleteUser(id, response);

    return this.send(response, 405, { message: "Method not allowed" });
  }

  private listUsers(url: URL, response: ServerResponse): void {
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 10), 1), 100);
    const users = [...this.users.values()];
    const start = (page - 1) * limit;

    this.send(response, 200, users.slice(start, start + limit), {
      "x-pagination-page": String(page),
      "x-pagination-limit": String(limit),
      "x-pagination-total": String(users.length),
    });
  }

  private getUser(id: number, response: ServerResponse): void {
    const user = this.users.get(id);
    this.send(response, user ? 200 : 404, user ?? { message: "Resource not found" });
  }

  private createUser(input: UserInput, response: ServerResponse): void {
    const errors = this.validate(input, true);
    if (errors.length) return this.send(response, 422, errors);

    if ([...this.users.values()].some((user) => user.email === input.email)) {
      return this.send(response, 422, [{ field: "email", message: "has already been taken" }]);
    }

    const user: User = {
      id: this.nextId++,
      name: input.name!,
      gender: input.gender as Gender,
      email: input.email!,
      status: input.status as UserStatus,
    };
    this.users.set(user.id, user);
    this.send(response, 201, user);
  }

  private updateUser(id: number, input: UserInput, fullUpdate: boolean, response: ServerResponse): void {
    const existing = this.users.get(id);
    if (!existing) return this.send(response, 404, { message: "Resource not found" });

    const candidate = fullUpdate ? input : { ...existing, ...input };
    const errors = this.validate(candidate, true);
    if (errors.length) return this.send(response, 422, errors);

    const updated: User = {
      id,
      name: candidate.name!,
      gender: candidate.gender as Gender,
      email: candidate.email!,
      status: candidate.status as UserStatus,
    };
    this.users.set(id, updated);
    this.send(response, 200, updated);
  }

  private deleteUser(id: number, response: ServerResponse): void {
    if (!this.users.delete(id)) return this.send(response, 404, { message: "Resource not found" });
    response.writeHead(204).end();
  }

  private validate(input: UserInput, allFieldsRequired: boolean): ApiError[] {
    const errors: ApiError[] = [];
    const required = ["name", "gender", "email", "status"] as const;

    if (allFieldsRequired) {
      for (const field of required) {
        if (!input[field]?.trim()) errors.push({ field, message: "can't be blank" });
      }
    }
    if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      errors.push({ field: "email", message: "is invalid" });
    }
    if (input.gender && !["female", "male"].includes(input.gender)) {
      errors.push({ field: "gender", message: "is invalid" });
    }
    if (input.status && !["active", "inactive"].includes(input.status)) {
      errors.push({ field: "status", message: "is invalid" });
    }
    return errors;
  }

  private async readBody(request: IncomingMessage): Promise<UserInput> {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    if (!chunks.length) return {};
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as UserInput;
  }

  private send(
    response: ServerResponse,
    status: number,
    body: unknown,
    headers: Record<string, string> = {},
  ): void {
    response.writeHead(status, { "content-type": "application/json", ...headers });
    response.end(JSON.stringify(body));
  }
}
