/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
  Cluster tests are run if there is a pre-existing minikube cluster. Before running cluster tests the TEST_NAMESPACE
  namespace is removed, if it exists, from the minikube cluster. Resources are created as part of the cluster tests in the
  TEST_NAMESPACE namespace. This is done to minimize destructive impact of the cluster tests on an existing minikube
  cluster and vice versa.
*/
import type { Application } from "spectron";
import * as utils from "../helpers/utils";
import { listHelmRepositories } from "../helpers/utils";
import { fail } from "assert";

jest.setTimeout(60000);

// FIXME (!): improve / simplify all css-selectors + use [data-test-id="some-id"] (already used in some tests below)
describe("Lens integration tests", () => {
  let app: Application;

  const click = async (selector: string) => {
    return (await app.client.$(selector)).click();
  };

  const waitUntilTextExists = async (selector: string, text: string, timeout = 5_000) => {
    return app.client.waitUntil(async () => {
      const elem = await app.client.$(selector);

      await elem.waitForExist({ timeout });

      const selectorText = await elem.getText();

      return Array.isArray(selectorText)
        ? selectorText.some((s) => s.includes(text))
        : selectorText.includes(text);
    }, { timeout });
  };

  describe("app start", () => {
    utils.beforeAllWrapped(async () => {
      app = await utils.appStart();
    });

    utils.afterAllWrapped(async () => {
      if (app?.isRunning()) {
        await utils.tearDown(app);
      }
    });

    describe("preferences page", () => {
      it('shows "preferences"', async () => {
        const appName: string = process.platform === "darwin" ? "OpenLens" : "File";

        await (app.electron as any).ipcRenderer.send("test-menu-item-click", appName, "Preferences");
        await waitUntilTextExists("[data-testid=application-header]", "Application");
      });

      it("shows all tabs and their contents", async () => {
        await click("[data-testid=application-tab]");
        await click("[data-testid=proxy-tab]");
        await waitUntilTextExists("[data-testid=proxy-header]", "Proxy");
        await click("[data-testid=kube-tab]");
        await waitUntilTextExists("[data-testid=kubernetes-header]", "Kubernetes");
        await click("[data-testid=telemetry-tab]");
        await waitUntilTextExists("[data-testid=telemetry-header]", "Telemetry");
      });

      it("ensures helm repos", async () => {
        const repos = await listHelmRepositories();

        if (repos.length === 0) {
          fail("Lens failed to add any repositories");
        }

        await click("[data-testid=kube-tab]");
        await waitUntilTextExists("div.repos .repoName", repos[0].name); // wait for the helm-cli to fetch the repo(s)
        await click("#HelmRepoSelect"); // click the repo select to activate the drop-down
        await waitUntilTextExists("div.Select__option", "");  // wait for at least one option to appear (any text)
      });
    });

    it.skip('quits Lens"', async () => {
      await app.client.keys(["Meta", "Q"]);
      await app.client.keys("Meta");
    });
  });
});
