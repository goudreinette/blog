    Title: Writing a Lisp
    Date: 2017-03-18T18:22:23
    Tags: Lisp, Haskell

I've been working on my first general purpose programming language last week, guided by the books SICP and Write Yourself a Scheme in 48 Hours.
 This has been a goal of mine for a long time, but it somehow always looked intimidating.
I was glad to find out that interpreters can actually be astonishingly simple, and would like to share what I learned along the way.

<!-- more -->

This code is based on Write Yourself a Scheme. If you'd like to see the code in context, you can follow along [here](https://github.com/reinvdwoerd/lisp).

## Implementing macro's 
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
  -- required to determine evaluation order
  evaluatedFunc <- eval env func
  case evaluatedFunc of
    Func {isMacro = True} ->
      -- evaluate macro results
      apply evaluatedFunc args >>= eval env

    _ ->
      -- evaluate function arguments
      evalMany env args >>= apply evaluatedFunc
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


## Varargs and special forms
The combination of macro's and varargs allowed me to define some additional special forms from within the language.

#### let
Let can be derived from lambda, binding arguments to parameters and creating a new local enviroment.

```scheme
(define (binding-vars bindings)
  (map first (pairs bindings)))

(define (binding-vals bindings)
  (map second (pairs bindings)))

(define-syntax (let bindings . body)
  (list* (list* 'lambda  (binding-vars bindings) body) 
         (binding-vals bindings))))

(let (x 10
      y 3)
  (* x y)) ;=> 30
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



## Require
Require is still implemented at the language level.
I might switch to a macro later.

It works by evaluating all expressions in the file, collecting the results and returning them as a list.
I found this behaviour useful in the Repl to discover imported identifiers.

```haskell
eval env (List [Symbol "require", Symbol filepath]) -> do
      contents <- liftIO $ readFile (filepath ++ ".lisp")
      forms <- parseFile contents
      results <- traverse (eval env) forms
      return $ List result
```

```
lisp=> (require lisp/core)
(a inc compose flip second last list pair ...)
```


## Enviroment inspection
I made the current lexical enviroment accessible using `(env)`.
A useful feauture to have when debugging.


```haskell
-- Env.hs
getVars :: Env -> IOThrowsError [(String, LispVal)]
getVars envRef = do
  env <- liftIO $ readIORef envRef
  let vars = map fst env
  vals <- traverse (getVar envRef) vars
  return $ zip vars vals


-- Eval.hs
eval env (List [Symbol "env"]) = do
  vars <- getVars env
  return $ List $ map toPair vars
  where toPair (var, val) = List [Symbol var, val])
```

```
lisp=> (env)
((+ <primitive function>) (a 10) ...)
```



## Repl
During development I used the convenient `rlwrap` to improve repl usability.
I later replaced it with Haskeline.
Any thrown errors are printed red.

```haskell
import           System.Console.ANSI
import           System.Console.Haskeline

repl = do
  globalEnv <- newEnv
  runInputT defaultSettings $ loop globalEnv

loop env = do
  line <- getInputLine "lisp=> "
  case line of
    Nothing -> return ()
    Just expr -> do
      evaled <- liftIO $ evalString env expr
      liftIO $ either printError print evaled
      loop env

evalString :: Env -> String -> IO (Either LispError LispVal)
evalString env expr =
  runExceptT (parseLine expr >>= eval env)

printError err = do
  setSGR [SetColor Foreground Vivid Red]
  print err
  setSGR [Reset]
```


## Conclusion
I hope you found this writeup useful.
Any suggestions for improvements are very much appreciated!