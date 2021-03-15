FROM node as web_assets

LABEL maintainer="lixiumiao@gmail.com"
ENV LANG C.UTF-8
ENV APP_ROOT /app

WORKDIR $APP_ROOT
COPY package.json $APP_ROOT
COPY yarn.lock $APP_ROOT
RUN yarn install
COPY . $APP_ROOT
RUN yarn build

FROM alpine
ENV APP_ROOT /app
COPY --from=web_assets $APP_ROOT/dist $APP_ROOT/web_assets
CMD sh
