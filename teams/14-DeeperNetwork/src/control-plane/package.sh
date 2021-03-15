#!/bin/bash

ARCH=$(uname -m)

if [ "$ARCH" == "x86_64" ]; then
  pkg . -t node10-linux-x64 --out-path=pkg/
else
  pkg . -t node10-linux-arm64 --out-path=pkg/
fi
