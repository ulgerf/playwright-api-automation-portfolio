import { After, Before, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { MockApiServer } from "./mockApiServer";
import { ApiWorld } from "./world";

export const apiServer = new MockApiServer();

BeforeAll(async () => {
  await apiServer.start();
});

Before(async function (this: ApiWorld) {
  apiServer.reset();
  await this.createApiContext(apiServer.baseUrl);
});

After(async function (this: ApiWorld) {
  await this.dispose();
});

AfterAll(async () => {
  await apiServer.stop();
});
