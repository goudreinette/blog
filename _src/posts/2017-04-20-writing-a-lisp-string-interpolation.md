    Title: Writing a Lisp: String Interpolation
    Date: 2017-04-20T11:03:12
    Tags: Lisp, Haskell

String interpolation is one of my favorite language features.
The resulting string is much easier to visualize than with manual concatenation. It's also straightforward to implement. I thought it would be a nice addition to [my Lisp](http://reinvanderwoerd.nl/blog/2017/03/18/writing-a-lisp/).

<!-- more -->

```scheme
(define day "Sunday")

"It's a lovely ~day morning" ;=> "It's a lovely Sunday morning"
"(+ 1 1) is ~(+ 1 1)" ;=> "(+ 1 1) is 2"
```

Both symbols and lists are supported.
It would be possible to support the other types of expressions as well, but they are already evaluated and printed literally.

## Native
To append strings, a new primitive function is required.
`stringAppend` turns all it's arguments into strings, and concatenates them.
`unpackString` differs slightly from show: it doesn't surround strings with quotes.

```haskell
primitives :: [(String, [LispVal] -> LispVal)]
primitives = [ -- ...
              ("string-append", stringAppend)]

stringAppend =
  String . concatMap unpackString

unpackString (String s) = s
unpackString v = show v
```

## Parsing
Strings are parsed into their parts, where a part is either an interpolated expression or a string literal. The resulting list is wrapped in a call to `string-append`. To keep complexity manageable, I decided against string escaping.

```haskell
interpolation = do
  char '~'
  list <|> symbol

literalString =
  String <$> many1 (noneOf "\"~")

string = do
  char '"'
  xs <- many (literalString <|> interpolation)
  char '"'
  return $ List (Symbol "string-append" : xs)
```


## Evaluation
Because string interpolation expands into an ordinary function call,
no new evaluation rules were required. Translating syntax into regular Lisp forms at the parsing stage really helps contain the scope of this complexity.