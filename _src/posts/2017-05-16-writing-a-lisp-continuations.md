    Title: Writing a Lisp: Continuations
    Date: 2017-05-16T14:07:54
    Tags: Lisp, Haskell

This week I worked on adding continuations to my Lisp.
I think they are really interesting, and the [survey]() revealed that many of you think the same.
It may have been the most challenging feature so far, both to implement and explain, but the result has been worth it.

Benefit to reader: understand more of computing fundamentals, lisp implementation.

Resources: Beautiful Racket, Wikipedia: call/cc, continuations


<!-- more -->

First, what are continuations?

> A con­tin­u­a­tion is a spe­cial kind of func­tion that’s like a book­mark to the loca­tion of an expres­sion. Con­tin­u­a­tions let you jump back to an ear­lier point in the pro­gram, thereby cir­cum­vent­ing the con­trol flow of the usual eval­u­a­tion model. <cite>[Beautiful Racket](http://beautifulracket.com/explainer/continuations.html)</cite>

Continuations can also be used to implement other control mechanisms like exceptions, the `return` statement, generators, coroutines, and so on.

The following examples are taken from Beautiful Racket.

`let/cc` binds the current continuation to `here`.
It evaluates the let block, which binds the continuation to `cont`.
The last expression is returned normally, and the evaluation continues.

```scheme
(define cont nil)

(+ 1 (+ 2 (+ 3 (+ (let/cc here
                    (set! cont here) 4) 
                  5)))) ; 15
```

## Ordinary functions
In my lisp, continuations are just ordinary functions.
The primitive is the `short-circuit` form.
It short circuits evaluation, immediately transfering control over to the continuation.

```scheme
(lambda (x) (<primitive> (+ 1 (+ 2 (+ 3 (+ x 5))))))
```

Invoking it skips the surrounding expression.

```scheme
(* 10 (cont 10)) ; 21, not 210
```


Another example: the return statement.

```scheme
(define (return-test)
  (let/cc return
    1 (return 2) 3))) 

(return-test) ; 2
```


## Macro

The let form is really just syntactic sugar.
It's expanded into a call to `call/cc`, short for [call-with-currurent-continuation](https://en.wikipedia.org/wiki/Call-with-current-continuation).

```scheme
(define-syntax (let/cc sym . body)
  '(call/cc ~(list* 'lambda '(~sym) body)))
```


## Implementation

To account for the possibility of early exit, I added EitherT to the monad stack, where
Left represents an early exit, and Right the usual order of evaluation.

```haskell
newtype LispM a = LispM 
  { unLispM :: EitherT LispVal (StateT Callstack IO) a }
  deriving ( Monad
           , Functor
           , Applicative
           , MonadIO
           , MonadState Callstack)

```

`run` extracts the Either from the LispM monad, using an empty call stack.

```haskell
run :: LispM a -> IO (Either LispVal a)
run m =
  evalStateT (runEitherT (unLispM m)) []
```

`shortCircuit` is just a synonym for `left` and `throwError`.

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


shortCircuit' = 
  wrapPrimitive False Impure sc
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


topFrame =
  State.get
  <&> reverse
  <&> map extractCallframe
  <&> find containsCallCCForm
  <&> fromJust


extractCallframe (Callframe val) =
  val


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