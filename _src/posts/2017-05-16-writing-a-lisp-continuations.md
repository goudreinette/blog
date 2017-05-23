    Title: Writing a Lisp: Continuations
    Date: 2017-05-16T14:07:54
    Tags: Lisp, Haskell

This week I added continuations to my Lisp.
They're a fascinating feature, and a popular demand in the [survey](http://reinvanderwoerd.nl/blog/2017/04/24/writing-a-lisp-help-me-decide-what-to-tackle-next/). 
It has been the most challenging feature so far, both to implement and explain, but the result has been worth it.

<!-- more -->

First, what are continuations?

> A con­tin­u­a­tion is a spe­cial kind of func­tion that’s like a book­mark to the loca­tion of an expres­sion. Con­tin­u­a­tions let you jump back to an ear­lier point in the pro­gram, thereby cir­cum­vent­ing the con­trol flow of the usual eval­u­a­tion model. <cite>[Beautiful Racket](http://beautifulracket.com/explainer/continuations.html)</cite>

Continuations can be used to implement other control mechanisms like exceptions, `return`, generators, coroutines, and so on.

In this example, `let/cc` binds the current continuation to `here`.
It evaluates the let block, which assigns the continuation to `cont`.
The last expression is returned as usual, and the evaluation continues.

```scheme
(define cont nil)

(+ 1 (+ 2 (+ 3 (+ (let/cc here
                    (set! cont here) 4) 
                  5)))) ; 15
```

## Ordinary functions
In my lisp, continuations are just ordinary functions, containing a `short-circuit` form.
This transparency makes debugging easier, and the implementation smaller.

```scheme
(lambda (x) (<primitive> (+ 1 (+ 2 (+ 3 (+ x 5))))))
```

When invoked, `short-circuit` immediately transfers control to the continuation, skipping the surrounding expression.

```scheme
(* 10 (cont 10)) ; 21, not 210
```


Another example: the return statement.
In this case control immediately jumps back to the top of the function scope, returning the given value.

```scheme
(define (return-test)
  (let/cc return
    1 (return 2) 3))) 

(return-test) ; 2
```


## Let as a macro

The let form is really just syntactic sugar.
It's expanded into a call to `call/cc`, short for [call-with-current-continuation](https://en.wikipedia.org/wiki/Call-with-current-continuation).

```scheme
(define-syntax (let/cc sym . body)
  '(call/cc ~(list* 'lambda '(~sym) body)))
```


## Early exit with either

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

## Capturing the context

`call/cc` and `shortCircuit` are also reified special forms.
`call/cc` is predefined in the enviroment.
When it is invoked, it captures the surrounding computation, wraps it inside of a function, 
and passes it to it's argument.

When the continuation is invoked, it calls `shortCircuit'` on it's body, and the evaluation continues from there.

```haskell
impurePrimitiveMacros =
  wrapPrimitives True Impure
    [--
     ("call/cc", callCC)]

callCC env [l] = do
  lambda <- eval env l
  cont <- makeCont
  eval env $ List [lambda, cont]

  where makeCont = do
          contFnBody <- topFrame >>= walk replaceContForm
          return $ makeFn False Anonymous [Symbol "x"]
                     [List [shortCircuit', contFnBody]]
                     env

shortCircuit' = 
  wrapPrimitive False Impure sc
  where sc env [val] = do
          r <- eval env val
          shortCircuit r
          return r

```

The outermost expression that lexically contains the `call/cc` form is used as the continuation.
This avoids infinite loops when used inside of named functions, where the continuation and named function would keep calling each other indefinitely.

```haskell
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
```

Finally, the `call/cc` form itself is replaced by the parameter 'x'.

```haskell
replaceContForm val =
  return $ case val of
    List [Symbol "call/cc", _] ->
      Symbol "x"
    _                          ->
      val
```

## Evaluation and error handling

After evaluating code, the result is unwrapped from the LispM monad and printed.
Because both Left and Right must contain a LispVal at this point, they are treated equally.

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

## Further reading
Beautiful Racket has a great [chapter](http://beautifulracket.com/explainer/continuations.html) on continuations. <br/>
The Wikipedia [page](https://en.wikipedia.org/wiki/Continuation) also gives a decent overview of the topic.