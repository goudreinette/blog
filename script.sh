#!/bin/sh

DIR=$(dirname "$0")

if [[ $(git status -s) ]]
then
    echo "The working directory is dirty. Please commit any pending changes."
    exit 1;
fi

echo "Deleting old publication"
rm -rf out
mkdir out
git worktree prune
rm -rf .git/worktrees/out/

echo "Checking out gh-pages branch into out"
git worktree add -B gh-pages out origin/gh-pages

echo "Removing existing files"
rm -rf out/*

echo "Generating site"
raco frog -b

echo "Updating gh-pages branch"
cd out && git add --all && git commit -m "Publishing to gh-pages (publish.sh)"