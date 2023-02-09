/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


export type ReleaseChannel = "alpha" | "beta" | "latest" | "none";

const noChannel: UpdateChannel = {
  id: "none",
  label: "None",
  moreStableUpdateChannel: null,
};

const latestChannel: UpdateChannel = {
  id: "latest",
  label: "Stable",
  moreStableUpdateChannel: noChannel,
};

const betaChannel: UpdateChannel = {
  id: "beta",
  label: "Beta",
  moreStableUpdateChannel: latestChannel,
};

const alphaChannel: UpdateChannel = {
  id: "alpha",
  label: "Alpha",
  moreStableUpdateChannel: betaChannel,
};

export const updateChannels = {
  none: noChannel,
  latest: latestChannel,
  beta: betaChannel,
  alpha: alphaChannel,
};

export interface UpdateChannel {
  readonly id: ReleaseChannel;
  readonly label: string;
  readonly moreStableUpdateChannel: UpdateChannel | null;
}
