    Title: Writing a Lisp: spit and slurp
    Date: 2017-05-03T13:02:48
    Tags: Lisp, Haskell

To make my Lisp a more useful language, and to pave the road for a module system and package manager, I added the capability of performing IO.

<!-- more -->

 I like the names `spit` and `slurp` for this functionality, and I think using slurp as a unified interface for network and file IO is an elegant idea. Let's see them in action:


```scheme
(spit "todo.txt" "Remember the milk") ;=> nil
(slurp "todo.txt") ;=> "Remember the milk"

(slurp "https://httpbin.org/get") 
;=> "{"args": {}, "headers": { "Accept-Encoding": ..."
```

## Implementation

Spit simply writes a string to a file, returning nil.

```haskell
spit :: Env -> [LispVal] -> IO LispVal
spit _ [String f, String s] = do
  writeFile f s
  return Nil
```

Slurp uses the [uri](https://hackage.haskell.org/package/uri) package to check if the given location is a network resource.
If it is, it uses [wreq](http://www.serpentine.com/wreq/tutorial.html) to make a get request, extracting the response body and turning it into a string.
Otherwise, it reads the file at the given location.
The result is turned into a Lisp string either way.

In case you're wondering, the `<&>` operator comes from the lens package, and is defined as `flip fmap`.

```haskell
slurp :: Env -> [LispVal] -> IO LispVal
slurp _ [String s] =
  String <$> case parseURI s >>= uriScheme of
    Just _ -> get s <&> (^. responseBody) <&> toString
    _      -> readFile s
```

Finally, the functions are wrapped in a LispVal constructor, and defined in the enviroment.

```haskell
impurePrimitives :: [(String, LispVal)]
impurePrimitives = wrapPrimitives False Impure 
  [ --
   ("slurp", slurp), 
   ("spit", spit)]
```
