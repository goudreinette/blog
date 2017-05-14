    Title: Writing a Lisp: Explicit Stack and Stacktraces
    Date: 2017-05-11T13:10:52
    Tags: Haskell, Lisp

I worked on a new feature for my Lisp this week: an explicit stack and stacktraces.
Stacktraces make debugging easier by improving error messages.
An explicit stack makes them possible, and is necessary to implement continuations later.


<!-- more -->
```scheme
(define (inc x) (+ x 1))

(* 2 (inc 1 1))
; Wrong number of arguments: expected 1, got 2
; (inc 1 1)
; (* 2 (inc 1 1))
```
    
The stack is threaded through the interpreter with a StateT monad transformer.
I chose to put entire functions inside callframes instead of just their identifiers, because this makes implementing continuations easier.

```haskell
data Callframe = Callframe Fn Arguments
type Callstack = [Callframe]
type CallstackIO a = StateT Callstack IO a
```

Before evaluating code, an empty stack is created.
Afterwards, the action is extracted from the StateT transformer to be executed. 

```haskell
evalString =
  evalWithCatch action
  where action env string = do
          readtable <- getReadtable env
          readOne readtable string 
          >>= eval env 
          >>= liftIO . print

evalWithCatch f env x = do
  let action = evalStateT (f env x) []
  catch action (printError :: LispError -> IO ())
```

When a function is invoked, it is pushed onto the stack along with it's arguments.
Afterwards, it's popped off the stack, and it's result is returned.

```haskell
eval :: Env -> LispVal -> CallstackIO LispVal
eval env val =
  case val of
    --
    List (fsym : args) -> do
      (Fn f) <- eval env fsym
      push f args
      result <- if isMacro f then
                  apply env (fnType f) args >>= eval env
                else
                  evalMany env args >>= apply env (fnType f)
      pop
      return result
    --


push :: Fn -> Arguments -> CallstackIO ()
push f args =
  modify addFrame
  where addFrame xs =
          Callframe f args : xs


pop :: CallstackIO ()
pop = modify tailSafe
```

Errors needed to be able to carry a call stack.

```haskell
data LispError = LispError ErrorType Callstack
  deriving (Typeable)
```

I also needed a new `throw` function to use with the `CallstackIO` monad, capturing the stack. 

```haskell
throwWithStack :: ErrorType -> CallstackIO a
throwWithStack e = do
  stack <- get
  liftIO $ throw $ LispError e stack
```

When printing an error, the message is displayed as before, while the callframes are printed line by line below it.

```haskell
instance Show LispError where
  show (LispError errType stack) =
    show errType ++ "\n" 
    ++ unlines (map show stack)

instance Show Callframe where
  show (Callframe FnRecord {name = name} args) =
    "(" ++ showName name ++ " " 
        ++ showListContents args ++ ")"
```
