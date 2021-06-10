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
import { spawnSync } from "child_process";
import type { Application } from "spectron";
import { sleep } from "./utils";

export function minikubeReady(testNamespace: string): boolean {
  // determine if minikube is running
  {
    const { status } = spawnSync("minikube status", { shell: true });

    if (status !== 0) {
      console.warn("minikube not running");

      return false;
    }
  }

  // Remove TEST_NAMESPACE if it already exists
  {
    const { status } = spawnSync(`minikube kubectl -- get namespace ${testNamespace}`, { shell: true });

    if (status === 0) {
      console.warn(`Removing existing ${testNamespace} namespace`);

      const { status, stdout, stderr } = spawnSync(
        `minikube kubectl -- delete namespace ${testNamespace}`,
        { shell: true },
      );

      if (status !== 0) {
        console.warn(`Error removing ${testNamespace} namespace: ${stderr.toString()}`);

        return false;
      }

      console.log(stdout.toString());
    }
  }

  return true;
}

export async function waitForMinikubeDashboard(app: Application) {
  await (await app.client.$("div.TableCell=minikube")).waitForExist();
  await (await app.client.$(".Input.SearchInput input")).waitForDisplayed();
  await (await app.client.$(".Input.SearchInput input")).setValue("minikube");
  await sleep(500);
  await (await app.client.$("div.TableCell=minikube")).waitForExist();
  await (await app.client.$("div.TableRow")).click();
  await sleep(500);
  await (await app.client.$("div.drawer-title-text=KubernetesCluster: minikube")).waitForExist();
  await (await app.client.$("div.EntityIcon div.HotbarIcon div div.MuiAvatar-root")).click();
  await (await app.client.$("pre.kube-auth-out*=Authentication proxy started")).waitForExist();

  const iframe = await app.client.$(`iframe[name="minikube"]`);

  await iframe.waitForDisplayed();
  await iframe.waitForExist();
  app.client.switchToFrame(iframe);
  await (await app.client.$("div.Sidebar")).waitForExist();
}
