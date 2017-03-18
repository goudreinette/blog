    Title: Writing a Lisp
    Date: 2017-03-18T18:22:23
    Tags: DRAFT

I've been working on my first general purpose programming language last week, guided by the books Structure and Interpretation of Computer Programs and Write Yourself a Scheme in 48 Hours.
 This has been a goal of mine for a long time, but it somehow always looked intimidating.
I was glad to find out that interpreters can actually be astonishingly simple, and would like to share what I learned along the way. If you'd like to see the code in context, you can follow along [here](https://github.com/reinvdwoerd/lisp).

<!-- more -->
## Macro's 
Since macro's are just functions of `code -> code`,
adding a simple macro system to my Lisp was fairly easy. 
First, I added an additional field to my function record to identify macro's.

``` haskell
data LispVal =  ...  
                | Func { isMacro :: Bool, -- new
                         params  :: [String],
                         body    :: [LispVal],
                         closure :: Env }
```

Next, I wrote a new evaluation rule for macro definitions.

```haskell
makeFn isMacro params body env =
  --

makeMacro = makeFn True

eval env (List (Symbol "define-syntax" : List (Symbol var : params) : body)) =
  makeMacro params body env >>= defineVar env var
```

Finally, I changed the way macro invocations are evaluated,
by passing arguments to the macro unevaluated, and evaluating the result  instead.

```haskell
eval env (List (func : args)) = do
  evaluatedFunc <- eval env func -- required to determine evaluation order
  case evaluatedFunc of
    Func {isMacro = True} ->
      apply evaluatedFunc args >>= eval env -- evaluate results

    _ ->
      evalMany env args >>= apply evaluatedFunc -- evaluate arguments
```

To make macro's more easy to use, I added syntax and evaluation rules for quote/unquote.

```haskell
quote = do
  char '\''
  form <- expr
  return $ List [Symbol "quote", form]

unquote = do
  char '~'
  form <- expr
  return $ List [Symbol "unquote", form]

expr :: Parser LispVal
expr = ... <|> quote <|> unquote
```

Quoted expressions are walked, and any unquoted expression within is replaced by it's evaluated result. 

```haskell
eval env (List [Symbol "quote", form]) = do 
  evalUnquotes form
  where evalUnquotes form =
          case form of
            List [Symbol "unquote", form] ->
              eval env form
            List items -> do
              results <- traverse evalUnquotes items
              return $ List results
            _ ->
              return form
```

After this, you should have a fully functional macro system, and additional syntax like the following can be defined from within the language: 

```lisp
(define-syntax (unless test then)
  '(if (not ~test)
     ~then
      nil))
```


## Variable arguments
Variable arguments, combined with macro's, allowed me to define some additional special forms within the language.



## Language boundaries
Haskell's type system was an especially big help in implementing the language. 

- Interop with host language: conversion layer
- Abstract accessors
- AST: decouple syntax from evaluation


## Repl
- (env)
- rlwrap
- Haskeline



## Getting Started
- Clojure
- Instaparse
- Tests
- Trouble with mutable enviroments
- Representing it as a stack
- Difficulities drawing the line between interpreted/host language
- Bad Repl experience
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
- Internal definitions

## Finishing up
- Smaller core
- Varargs + macro's: less syntax needed
- Stack, run-stack
- License

## What's next
- Racket
