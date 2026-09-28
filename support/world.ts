import { APIRequestContext, APIResponse, request } from "@playwright/test";
import { IWorldOptions, setWorldConstructor, World } from "@cucumber/cucumber";
import type { UserInput } from "./types";

export class ApiWorld extends World {
  api!: APIRequestContext;
  response?: APIResponse;
  createdUserId?: number;
  requestBody?: UserInput;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async createApiContext(baseURL: string): Promise<void> {
    this.api = await request.newContext({
      baseURL,
      extraHTTPHeaders: {
        accept: "application/json",
        "content-type": "application/json",
      },
    });
  }

  async dispose(): Promise<void> {
    await this.api.dispose();
  }

  authorizationHeaders(authorized = true): Record<string, string> {
    return { Authorization: authorized ? "Bearer portfolio-token" : "Bearer invalid-token" };
  }
}

setWorldConstructor(ApiWorld);
