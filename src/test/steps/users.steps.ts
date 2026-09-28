import { DataTable, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ApiWorld } from "../../../support/world";
import type { ApiError, User, UserInput } from "../../../support/types";

function firstRow(table: DataTable): UserInput {
  return table.hashes()[0] as UserInput;
}

When("I request page {int} with a limit of {int}", async function (this: ApiWorld, page: number, limit: number) {
  this.response = await this.api.get(`/users?page=${page}&limit=${limit}`);
});

When("I request user {int}", async function (this: ApiWorld, id: number) {
  this.response = await this.api.get(`/users/${id}`);
});

When("I request the created user", async function (this: ApiWorld) {
  expect(this.createdUserId, "A user must be created before it can be requested").toBeDefined();
  this.response = await this.api.get(`/users/${this.createdUserId}`);
});

When(
  "I create an authorized user with:",
  async function (this: ApiWorld, table: DataTable) {
    this.requestBody = firstRow(table);
    this.response = await this.api.post("/users", {
      data: this.requestBody,
      headers: this.authorizationHeaders(),
    });
    if (this.response.status() === 201) {
      this.createdUserId = ((await this.response.json()) as User).id;
    }
  },
);

When(
  "I create an unauthorized user with:",
  async function (this: ApiWorld, table: DataTable) {
    this.requestBody = firstRow(table);
    this.response = await this.api.post("/users", {
      data: this.requestBody,
      headers: this.authorizationHeaders(false),
    });
  },
);

When("I update user {int} with:", async function (this: ApiWorld, id: number, table: DataTable) {
  this.response = await this.api.put(`/users/${id}`, {
    data: firstRow(table),
    headers: this.authorizationHeaders(),
  });
});

When("I partially update user {int} with:", async function (this: ApiWorld, id: number, table: DataTable) {
  this.response = await this.api.patch(`/users/${id}`, {
    data: firstRow(table),
    headers: this.authorizationHeaders(),
  });
});

When("I delete the created user", async function (this: ApiWorld) {
  expect(this.createdUserId, "A user must be created before it can be deleted").toBeDefined();
  this.response = await this.api.delete(`/users/${this.createdUserId}`, {
    headers: this.authorizationHeaders(),
  });
});

When("I delete user {int} without valid authorization", async function (this: ApiWorld, id: number) {
  this.response = await this.api.delete(`/users/${id}`, {
    headers: this.authorizationHeaders(false),
  });
});

Then("the response status should be {int}", function (this: ApiWorld, expectedStatus: number) {
  expect(this.response, "No API response is available").toBeDefined();
  expect(this.response!.status()).toBe(expectedStatus);
});

Then("the response should contain {int} user", async function (this: ApiWorld, expectedCount: number) {
  const users = (await this.response!.json()) as User[];
  expect(users).toHaveLength(expectedCount);
});

Then(
  "the pagination headers should show page {int} and limit {int}",
  function (this: ApiWorld, page: number, limit: number) {
    expect(this.response!.headers()["x-pagination-page"]).toBe(String(page));
    expect(this.response!.headers()["x-pagination-limit"]).toBe(String(limit));
  },
);

Then("the user response should contain:", async function (this: ApiWorld, table: DataTable) {
  const actual = (await this.response!.json()) as User;
  const expected = firstRow(table);
  expect(actual.name).toBe(expected.name);
  expect(actual.gender).toBe(expected.gender);
  expect(actual.email).toBe(expected.email);
  expect(actual.status).toBe(expected.status);
});

Then("the response field {string} should be {string}", async function (this: ApiWorld, field: keyof User, value: string) {
  const actual = (await this.response!.json()) as User;
  expect(String(actual[field])).toBe(value);
});

Then("the error message should be {string}", async function (this: ApiWorld, message: string) {
  const error = (await this.response!.json()) as ApiError;
  expect(error.message).toBe(message);
});

Then(
  "the validation error for {string} should be {string}",
  async function (this: ApiWorld, field: string, message: string) {
    const errors = (await this.response!.json()) as ApiError[];
    expect(errors).toContainEqual({ field, message });
  },
);
