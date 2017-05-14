    Title: Writing a Lisp: Reader Macro's
    Date: 2017-04-26T15:07:02
    Tags: Lisp, Haskell

Monday's [survey](http://reinvanderwoerd.nl/blog/2017/04/24/writing-a-lisp-help-me-decide-what-to-tackle-next/) revealed that Reader Macro's are your most requested feature. They replace built-in syntax, and enable users to extend the syntax from within the language. Implementing them right is difficult, however. Let's try.

<!-- more -->

```scheme
(define-syntax (trace form)
  '(let (result ~form)
      (print "'~form => ~'result")
      result))

(define readtable (cons '(^ trace) readtable))

^(* 3 2)
;(* 3 2) => 6
```


## Reifying special forms
In the theme of shrinking the core language, and to support calling `read`, I turned special forms into ordinary lisp values.
While written in Haskell, these special forms can be passed around, stored and returned like regular functions.

To avoid passing in the enviroment for all primitives, I needed a way to keep track of which primitives are macro's and which of them have side effects.

```haskell
data Purity  = Pure ([LispVal] -> LispVal)
             | Impure (Env -> [LispVal] -> IO LispVal)

data LispVal = -- ...
             | PrimitiveFunc { isMacro :: Bool, 
                               purity :: Purity }
```

The special forms are predefined in the enviroment.

```haskell
impurePrimitiveMacros =
  wrapPrimitives True Impure
    [("require", require),
     ("define", define),
     ("define-syntax", defineSyntax),
     ("lambda", lambda),
     ("if", if_)]

wrapPrimitives macro c =
  map (fmap (PrimitiveFunc macro . c))

-- For example
if_ env [pred, conseq, alt] = do
  result <- eval env pred
  case result of
    Bool False -> eval env alt
    _          -> eval env conseq
```

`apply` needed to pattern match on purity to accomodate for this change.

```haskell
apply :: Env -> LispVal -> [LispVal] -> IO LispVal
apply env PrimitiveFunc { purity = p } args =
  case p of
    Pure func ->
      return $ func args
    Impure func ->
      func env args
```

Because of all this, `eval` could be slimmed down considerably.

```haskell
eval :: Env -> LispVal -> IO LispVal
eval env val =
  case val of
    Symbol s ->
      getVar env s

    List [Symbol "quote", form] ->
      evalUnquotes form
      where evalUnquotes form =
              case form of
                List [Symbol "unquote", form] ->
                  eval env form
                List items -> do
                  List <$> traverse evalUnquotes items
                _ ->
                  return form

    List (func : args) -> do
      evaluatedFunc <- eval env func
      case evaluatedFunc of
        PrimitiveFunc {isMacro = True} ->
          apply env evaluatedFunc args >>= eval env
        Func {isMacro = True} ->
          apply env evaluatedFunc args >>= eval env
        _ ->
          evalMany env args >>= apply env evaluatedFunc

    _ ->
      return val
```


## The readtable
The mapping from starting characters to macro's is called the `readtable`.
It's just an ordinary global binding, because my Lisp doesn't have modules yet.
`getReadtable` retrieves it, and transforms it into a list of tuples.

The readtable stores the macro associations as symbols, because I wanted to avoid executing arbitrary code inside the parser. Because apply uses IO, this would make the parser unnecessarily complex. In addition, string interpolation and quoting were already implemented this way, which made migration easier.

```haskell
-- Env.hs
getReadtable :: Env -> IO [(String, String)]
getReadtable env = do
  List pairs <- getVar env "readtable"
  return $ map extractPair pairs
  where extractPair (List [Symbol s, Symbol sym]) =
          (s, sym)


-- Primitives.hs
impurePrimitives =
  wrapPrimitives False Impure
   [-- ...
    ("read", read')]

read' env [String s] = do
  readtable <- getReadtable env
  readOne readtable s
```

Quote and unquote are included by default. 
A beautiful side effect of this approach is that we can get rid of string interpolation almost entirely. An interpolation is in fact just `unquote`.

```haskell
readtable =
  List [List [Symbol "~", Symbol "unquote"],
        List [Symbol "'", Symbol "quote"]]
```

Let's prove it:

```scheme
''1 
;=> (quote 1)

'"10 / 2 is '~(/ 10 20)" 
;=> (string-append "10 / 2 is " (/ 10 20))
```

## Parametized parsing
To support this highly dynamic type of parsing, I moved some of the parsing functions inside the lexical scope of the main parser.
Strings automatically interpolate any defined reader macro. 

```haskell
readTableParser :: ReadTable -> Parser LispVal
readTableParser readtable =
  foldl1 (<|>) $ map makeParser readtable
  where makeParser (s, sym) = do
          string s
          e <- expr readtable
          return $ List [Symbol sym, e]


expr :: ReadTable -> Parser LispVal
expr readtable =
  e
  where e = p <|> lambda <|> symbol <|> number <|> string' <|> list
        p = readTableParser readtable

        -- ... numbers and symbols unchanged
        {- Lists -}
        list = do
          char '('
          contents <- sepBy e spaces
          char ')'
          return $ List contents

        {- Strings -}
        literalString =
          String <$> many1 (noneOf ('\"' : concatMap fst readtable))

        string' = do
          char '"'
          xs <- many (p <|> literalString)
          char '"'
          return $ List (Symbol "string-append" : xs)
```


## Conclusion
While still limited, these reader macro facilities simplify the language and enable easy extensibility.
I may add more advanced non-prefix reader macro's in the future.
If you enjoyed this post, or not, please give me some feedback in the [survey](http://reinvanderwoerd.nl/blog/2017/04/24/writing-a-lisp-help-me-decide-what-to-tackle-next/) so I can help you better. Have a nice day. 