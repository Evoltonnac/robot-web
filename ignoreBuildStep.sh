#!/bin/bash

echo "VERCEL_ENV: $VERCEL_ENV"
echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

# 1.FORCE_BUILD equals 1
# 2.in production env
# 3.branch name has coincident DOMAIN env
if [ "$FORCE_BUILD" == "1" ] || [ "$VERCEL_ENV" == "production" ] || [[ "$DOMAIN" != *"$VERCEL_GIT_COMMIT_REF"* ]]; then
  exit 1
else
  exit 0
fi