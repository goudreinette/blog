    Title: Writing a Lisp
    Date: 2017-03-18T18:22:23
    Tags: DRAFT

I've been working on my first general purpose programming language this week. This has been a goal of mine for a long time, but it somehow always looked intimidating.
I was glad to find out that interpreters can actually be astonishingly simple, and would like to share what I learned along the way.

<!-- more -->

## Getting Started
- Clojure
- Instaparse
- Tests
- Trouble with mutable enviroments
- Representing it as a stack
- Difficulities drawing the line between interpreted/host language
- Bad Repl experience
- Interop with host language: conversion layer
- Require


## Haskell
- Type system was a big help
- Write yourself a Scheme
- rlwrap
- Ordered SICP (on Sunday) to support decision making
- Parser Combinators
- ErrorT
- Enviroments: double mutable, copy references
- Lambda shorthand

## SICP: Metacircular Evaluator
- Internal definitions
- Macro's evaluate return value, not arguments
- Abstract accessors
- Internal definitions
- Enviroment inspection
- AST: decouple syntax from evaluation

## Finishing up
- Smaller core
- Varargs + macro's: less syntax needed
- Stack, run-stack
- Haskeline
- License

## What's next
- Racket
