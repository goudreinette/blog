    Title: Writing a Forth
    Date: 2017-06-08T16:01:47
    Tags: Writing a Forth, Haskell

This week I started working on a new, stack-based language: a Forth.

<!-- more -->

I like working on 'extreme' languages, because [applying a principle everywhere](http://blog.ezyang.com/2012/11/extremist-programming/) is the best way to learn it's possibilities and limitations.

Forth has an interesting philosophy: it [aims](http://www.ultratechnology.com/forththoughts.htm) for 'minimal overall complexity', sometimes at the cost of convenience, compatibility and safety.

Like Lisp, Forth has very little syntax, but powerful metaprogramming capabilities. Comment syntax and basic control flow can actually be [defined from inside the language](http://yosefk.com/blog/my-history-with-forth-stack-machines.html).


```forth
3 2 + .
\ 5 ok
: square dup * ;
\ ok
10 square .
\ 100 ok
```

## Implementation

Concatenative languages can be viewed in two (equivalent) ways:

- Procedures pushing and popping values on a shared, mutable stack
- Functions from stack to stack

I chose a StateT monad transformer to represent this.

```haskell
newtype Forth a = Forth
  { unForth :: StateT ForthState IO a }
  deriving (Functor, Applicative, Monad,
            MonadIO, MonadState ForthState)
```

The interpreter needs to keep track of two stacks (one for interpret and compile mode), the current mode, and the dictionary of words (enviroment).

```haskell
data ForthState = ForthState
    { interpretStack :: Stack
    , compileStack   :: Stack
    , mode           :: Mode
    , dict           :: Dictionary }
    deriving (Show)


data Mode = Interpret
          | Compile
          deriving (Show)


type Stack =  [Val]
type Dictionary = [(String, Val)]
```

Forth has a single top-level enviroment and no closures, which simplifies implementation.

```haskell
dictionary =
  [("+", numBinOp (+)),
   ("-", numBinOp (-)),
   ("*", numBinOp (*)),
   ("/", numBinOp quot),
   -- numeric operations ...
   (".", pop),
   ("dup", dup),
   ("swap", swap),
   (":", compileMode),
   (";", interpretMode),
   ("words", printDict)]
```

Functions get their arguments from the stack, and push their results back on the stack.

```haskell
numBinOp f = do
  (Number x) <- pop
  (Number y) <- pop
  push (Number (f x y))

dup = do
  x <- pop
  push x
  push x
```

When in compile mode, all words except `;` get pushed on the compile stack, instead of being invoked immediately.

```haskell
eval :: Val -> Forth Val
eval val = do
  state <- get
  case val of
    Number n ->
      push val
    Symbol w ->
      case mode state of
        Compile | w == ";" ->
          dictLookup w >>= invoke
        Compile ->
          push val
        Interpret ->
          dictLookup w >>= invoke
    _ -> return Nil


invoke :: Val -> Forth Val
invoke f =
  case wordType f of
    Primitive op -> op
    User stack   -> evalMany stack
```

When the interpreter encounters a `;`, it creates a new word from the compile stack, adds it to the dictionary, and exits compile mode.

```haskell
compileMode :: Forth Val
compileMode = setMode Compile

interpretMode :: Forth Val
interpretMode = do
  (Symbol w:body) <- get <&> stack <&> reverse
  defineWord w (makeWord body)
  clearStack
  setMode Interpret
```

## Conclusion
There's a lot left to explore with concatenative languages.
Control flow is still missing, and may require a separate 'return stack'.
Forth lets you mark words as 'immediate', which means they get executed immediately in compile mode.
I'm also exploring the potential of lambda's in Forth.

You can view the full code on [Github](https://github.com/reinvdwoerd/forth).
