#!/bin/bash
set -e

if [ -z "$1" ]; then
 	exec uart --help
else 
	exec "$@"
fi

