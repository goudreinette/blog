    Title: Writing a Lisp: Explicit Stack and Stacktraces
    Date: 2017-05-11T13:10:52
    Tags: Haskell, Lisp

I worked on a new feature for my Lisp last week: an explicit stack and stacktraces.
Stacktraces make debugging easier by improving error messages.
The explicit stack is also necessary for continuations later.


<!-- more -->
```scheme
(define (inc x) (+ x 1))

(inc 1 2)
; Wrong number of arguments: expected 1, got 2
; (* 2 (inc 1 1))
; (inc 1 1)
```
    
The stack is threaded through the interpreter with a State monad transformer.
I chose to put the entire function in a callframe because it's needed for continuations.

```haskell
data Callframe = Callframe Fn Arguments
type Callstack = [Callframe]
type CallstackIO a = StateT Callstack IO a
```

To evaluate something, we unwrap the action from the StateT transformer, and wrap it inside a catch.

```haskell
evalString =
  evalWithCatch action
  where action env string = do
          readtable <- getReadtable env
          readOne readtable string >>= eval env >>= liftIO . print

evalWithCatch f env x = do
  let action = evalStateT (f env x) []
  catch action (printError :: LispError -> IO ())
```

Before evaluating a functon call, the function is pushed onto the stack along with it's arguments.
Afterwards, it's popped off the stack and it's result is returned.

```haskell
eval :: Env -> LispVal -> CallstackIO LispVal
eval env val =
  case val of
    --
    List (fsym : args) -> do
      (Fn f) <- eval env fsym
      push f args
      result <- case f of
                  FnRecord {isMacro = True, fnType = fnType} ->
                    apply env fnType args >>= eval env
                  FnRecord {isMacro = False, fnType = fnType} ->
                    evalMany env args >>= apply env fnType
      pop
      return result
    --


push :: Fn -> Arguments -> CallstackIO ()
push f args =
  modify addFrame
  where addFrame xs =
          Callframe f args : xs


pop :: CallstackIO ()
pop =
  modify popFrame
  where popFrame (_:xs) =
          xs
        popFrame xs =
          xs
```

Errors now have a stack field.

```haskell
data LispError = LispError ErrorType Callstack
  deriving (Typeable)
```

To throw an error along with it's stack I needed a new function.

```haskell
throwWithStack :: ErrorType -> CallstackIO a
throwWithStack e = do
  stack <- get
  liftIO $ throw $ LispError e stack
```

To print a stack trace, the error is displayed as before, while the callframes are printed line by line.

```haskell
instance Show LispError where
  show (LispError errType stack) =
    show errType ++ "\n" ++ unlines (map show (reverse stack))

instance Show Callframe where
  show (Callframe FnRecord {name = name} args) =
    "(" ++ showName name ++ " " ++ showListContents args ++ ")"
```
