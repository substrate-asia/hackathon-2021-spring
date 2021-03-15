#!/bin/bash

# Use beautify_bash.py to format shell script
# Use shellcheck -x to check shell script

set -e

export NODE_OPTIONS="--max-old-space-size=8192"

AOS_DIR=$(pwd)
CP_DIR=$(pwd)
COMMON_JS_DIR=$CP_DIR/../common-js
DEEPER_CHAIN_DIR=$CP_DIR/../deeper-chain
BUILD_CLEAN=noclean
PKG_CACHE_DIR=~/.pkg-cache/v2.6
NODE_BINARY_FILE_AMD64=fetched-v10.21.0-linux-x64
NODE_BINARY_FILE_ARM64=fetched-v10.21.0-linux-arm64
NODE_BINARY_FILE=""
ARCH=$(uname -m)
LAST_BUILD_FILE=./last.bld

function print_usage() {
  echo "Usage: ./build.sh <cp/chain> [clean]"
}

function build_prepare() {
  if [ -f "$LAST_BUILD_FILE" ]; then
    LAST_ARCH_BUILD=$(cat $LAST_BUILD_FILE)
    echo "last build file is found, last:$LAST_ARCH_BUILD, cur:$ARCH"
  else
    echo "last build file is not found"
    LAST_ARCH_BUILD="unknown"
  fi

  if [ "$ARCH" != "$LAST_ARCH_BUILD" ]; then
    echo "arch mismatch, do clean"
    git clean -d -f -x
  fi

  if [ "$BUILD_CLEAN" == "clean" ]; then
    echo "clean by command, do clean"
    git clean -d -f -x
  fi
}

function build_finish() {
  echo $ARCH > $LAST_BUILD_FILE
}

function init_pkg_cache() {

  if [ "$ARCH" = "x86_64" ]; then
    NODE_BINARY_FILE=$NODE_BINARY_FILE_AMD64
  elif [ "$ARCH" = "aarch64" ]; then
    NODE_BINARY_FILE=$NODE_BINARY_FILE_ARM64
  fi

  # make sure pkg cache directory exists
  if [ ! -d "$PKG_CACHE_DIR" ]; then
    echo "PKG cache directory does not exist, creating..."
    mkdir -p $PKG_CACHE_DIR
  else
    echo "PKG cache directory already exists"
  fi

  cd $PKG_CACHE_DIR

  # make sure node binary file exists
  if [ ! -e "$NODE_BINARY_FILE" ]; then
    echo "Node binary file not exists, copying..."
    cp "$COMMON_JS_DIR/$NODE_BINARY_FILE" $PKG_CACHE_DIR
  else
    echo "Node binary file already exists"
  fi
}

function install_node() {
  init_pkg_cache
}


function build_common_js() {
  install_node
  echo "Building common js..."
  cd "$COMMON_JS_DIR" || exit

  build_prepare
    npm install -f
  build_finish
  cd "$AOS_DIR" || exit
  echo "================commonjs is built================"
}

function build_cp() {
  install_node

  build_common_js

  echo "Building cp..."
  cd "$CP_DIR" || exit

  build_prepare
    npm i -g pkg
    npm install -f
  build_finish

  rm -rf pkg
  npm run pkg
  cp ./node_modules/fs-ext/build/Release/fs-ext.node pkg/

  if [ "$ARCH" = "x86_64" ]; then
    profiler=$(find . -name "profiler.node" | grep x64)
  elif [ "$ARCH" = "aarch64" ]; then
    profiler=$(find . -name "profiler.node" | grep arm64)
  fi

  cp $profiler pkg/
  cd "$AOS_DIR" || exit
  echo "================cp is built================"
}

if [ $# != 1 ] && [ $# != 2 ]; then
  echo "wrong parameter number!"
  print_usage
  exit -1
fi

if [ $# == 2 ]; then
  if [ "$2" == "clean" ]; then
    BUILD_CLEAN="clean"
  elif [ "$2" == "noclean" ]; then
    BUILD_CLEAN="noclean"
  else
    echo "wrong second parameter!"
    print_usage
    exit -1
  fi
fi

function build_chain() {
  echo "Building deeper chain..."

  cd "$DEEPER_CHAIN_DIR" || exit

  cargo +nightly-2020-10-06 build --release

  cd "$AOS_DIR" || exit
  echo "================deeper chain is built================"
}

case $1 in
  cp )
    build_cp
    echo "Done."
  ;;
  #node env
  node )
    install_node
    echo "Done."
  ;;
  chain )
    build_chain
    echo "Done."
  ;;
  * )
    print_usage
  ;;
esac
