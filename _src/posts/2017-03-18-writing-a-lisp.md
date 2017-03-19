    Title: Writing a Lisp
    Date: 2017-03-18T18:22:23
    Tags: DRAFT

I've been working on my first general purpose programming language last week, guided by the books SICP and Write Yourself a Scheme in 48 Hours.
 This has been a goal of mine for a long time, but it somehow always looked intimidating.
I was glad to find out that interpreters can actually be astonishingly simple, and would like to share what I learned along the way. This code is based on Write Yourself a Scheme. If you'd like to see the code in context, you can follow along [here](https://github.com/reinvdwoerd/lisp).

<!-- more -->
## Implementing Macro's 
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

```scheme
(define-syntax (unless test then)
  '(if (not ~test)
     ~then
      nil))
```


## Varargs and Special Forms
The combination of macro's and varargs allowed me to define some additional special forms from within the language.

#### let
```scheme
(define (binding-vars bindings)
  (map first (pairs bindings)))

(define (binding-vals bindings)
  (map second (pairs bindings)))

(define-syntax (let bindings . body)
  (list* (list* 'lambda  (binding-vars bindings) body) 
         (binding-vals bindings))))

```

#### cond
What's interesting about this special form is that both it and 'if' can be defined in terms of each other.
Since Write Yourself a Scheme decided to make 'if' the primitive form, I wrote cond to expand to nested if's.
```scheme
(define (wrap-if acc clause)
  '(if ~(first clause)
     ~(second clause)
     ~acc))

(define-syntax (cond . clauses)
  (reduce wrap-if 'nil (reverse (pairs clauses))))


(define x 5)

(cond
  (symbol? x) "symbol"
  (number? x) "number"
  'else       "something else") ;=> "number"
```

#### do/begin
Evaluates it's arguments left to right, and returns the last result.
Since this is already the default evaluation order, all I needed to do was to return the last result.
```scheme
(define (do . forms)
  (last forms))

(do 
  (+ 1 1)
  (empty? '(1))) ;=> false
```


## Language boundaries
Haskell's type system was an especially big help in implementing the language. 

- Interop with host language: conversion layer
- Abstract accessors
- AST: decouple syntax from evaluation


## Require

## Repl
- (env)
- rlwrap
- Haskeline
- Pretty printing lambda's
