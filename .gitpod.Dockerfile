FROM gitpod/workspace-full

RUN corepack enable
RUN yarn set version berry
