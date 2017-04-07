#!/bin/sh

DIR=$(dirname "$0")


echo "Deleting old publication"
rm -rf out
mkdir out
git worktree prune
rm -rf .git/worktrees/out/

echo "Checking out master branch into out"
git worktree add -B master out origin/master

echo "Removing existing files"
rm -rf out/*

echo "Generating site"
raco frog -b
cp -r css out/css
cp -r js out/js
cp -r img out/img
cp -r fonts out/fonts



echo "Updating master branch"
cd out && git add --all && git commit -m "Publishing to master (publish.sh)" && git push