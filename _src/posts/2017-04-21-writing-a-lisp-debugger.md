    Title: Writing a Lisp: Debugger
    Date: 2017-04-21T20:49:03
    Tags: Lisp, Haskell

To make debugging easier, I added a simple `pry`-style debugger to my lisp.
It immediately spawns a new repl in the current envirment, allowing you to poke around at will.
Debug repl's can be nested to arbitrary depth, and exited with `:q`.

<!-- more -->

```scheme
lisp=> (define (dbg-test x) (debug))
dbg-test

lisp=> (dbg-test 10)
debug=> x
10

debug=> :q
nil

lisp=>
```

## Evaluation
Implementation was shockingly trivial once again.
`debug` is implemented as a special form, because the `repl` function isn't available in lisp code yet.

```haskell
eval env val =
  case val of
    -- ...
    List [Symbol "debug"] -> do
      liftIO $ repl "debug=> " $ evalString env
      return Nil
    -- ...
```

## Repl
I extracted the repl's code into a separate Hackage [package](https://hackage.haskell.org/package/haskeline-repl), because I often encounter the need for them in my projects.
Idris includes a readline-like repl function in Prelude, which inspired me.
A utility for printing text red is included as well.

```haskell
repl prompt f =
  runInputT defaultSettings loop where 
    loop = do
      line <- getInputLine prompt
      case line of
        Nothing -> return ()
        Just ":q" -> return ()
        Just input -> do
          liftIO $ f input
          loop

printError err = do
  setSGR [SetColor Foreground Vivid Red]
  print err
  setSGR [Reset]
```

## Conclusion
After yesterday's post Max Bernstein notified me of his ['Writing a Lisp' series](https://bernsteinbear.com/blog/lisp/) in OCaml.
It was interesting to compare the ideas and implementation, so I'm sharing it here.

I'll be investigating reader macro's soon.
If you have any suggestions for features or improvements, please don't hesitate to let me know.

