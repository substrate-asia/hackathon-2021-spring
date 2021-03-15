NODE    ?= node
CWD     ?= $(shell pwd)
ENV     ?= dev
NAME    ?= $(shell node -e 'console.log(require("./package.json").name)')

cfg = \
if [ -f .config.js ]; then \
	cat .config.js > config.js; \
elif [ -f .cfg_$(1).js ]; then \
	cat .cfg_$(1).js > config.js; \
fi

.PHONY: build dev config pull

.SECONDEXPANSION:

build: config
	@npm run $@
	@cd out/public; tar cfvz ../$(NAME).dpk ./*

dev: config
	@npm run $@

config:
	@$(call cfg,$(ENV))

pull:
	git pull
	git submodule update --init --recursive