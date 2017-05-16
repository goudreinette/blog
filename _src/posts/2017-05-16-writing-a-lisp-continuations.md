    Title: Writing a Lisp: Continuations
    Date: 2017-05-16T14:07:54
    Tags: Lisp, Haskell


What: Continuations

Why: popular demand, powerful control flow, 'return', exceptions, coroutines, threads, 

Benefit to reader: understand more of computing fundamentals, lisp implementation.

How: 

- function scope to avoid infinite loop
- Stack alone was clumsy.
- Either propagates beautifully, even through traverse, etc.
- Reified special form.
- Continuations are regular lambda's.
- Left is continuation, right IO a.


Resources: Beautiful Racket, Wikipedia: call/cc, continuations


<!-- more -->
## Examples

```scheme
(+ 1 (+ 2 (+ 3 (+ (let/cc here
                    (here 20) 4) 
                  5))))
```



```scheme
(define (return-test)
  (let/cc return
    1 (return 2) 3)))
```

## Continuations?


## Macro
```scheme
(define-syntax (let/cc sym . body)
  '(call/cc ~(list* 'lambda '(~sym) body)))
```


## Types

Monad Stack

```haskell
newtype LispM a = LispM 
  { unLispM :: EitherT LispVal (StateT Callstack IO) a }
  deriving ( Monad
           , Functor
           , Applicative
           , MonadIO
           , MonadState Callstack)

```

Extract the Either from the LispM monad

```haskell
run :: LispM a -> IO (Either LispVal a)
run m =
  evalStateT (runEitherT (unLispM m)) []
```

Short circuit evaluation order, abandoning current stack

```haskell
shortCircuit :: LispVal -> LispM ()
shortCircuit = LispM . left
```

## Primitives
```haskell

impurePrimitiveMacros =
  wrapPrimitives True Impure
    [--
     ("call/cc", callCC)]


shortCircuit' = wrapPrimitive False Impure sc
  where sc env [val] = do
          r <- eval env val
          shortCircuit r
          return r


callCC env [l] = do
  lambda <- eval env l
  cont <- makeCont
  eval env $ List [lambda, cont]

  where makeCont = do
          contFnBody <- topFrame >>= walk replaceContForm
          return $ makeFn False Anonymous [Symbol "x"]
                     [List [shortCircuit', contFnBody]]
                     env

        extractCallframe (Callframe val) =
          val

        topFrame =
          State.get
          <&> reverse
          <&> map extractCallframe
          <&> find containsCallCCForm
          <&> fromJust

        containsCallCCForm val =
          case val of
            List [Symbol "call/cc", _] ->
              True
            List xs                    ->
              any containsCallCCForm xs
            _                          ->
              False

        replaceContForm val =
          return $ case val of
            List [Symbol "call/cc", _] ->
              Symbol "x"
            _                          ->
              val
```

## Eval
```haskell
evalString :: Env -> String -> IO ()
evalString =
  runWithCatch action
  where action env string = do
          readtable <- getReadtable env
          let r = readOne readtable string >>= eval env
          liftIO $ run r >>= either printVal printVal


runWithCatch :: (Env -> String -> LispM ()) -> Env -> String -> IO ()
runWithCatch f env x = do
  let action = fromRight' <$> run (f env x)
  catch action (printError :: LispError -> IO ())
```