    Title: Writing a Forth: Quotations
    Date: 2017-06-11T16:00:35
    Tags: Writing a Forth, Haskell

Factor, another Forth-like language, introduces 'quotations' to the concatenative paradigm.

<!-- more -->


Quotations serve the same role as lambda's in other languages, but have a few key advantages:

**Concatenation is composition**: All functions can be viewed as `stack -> stack`; A program is a concatenation of those functions.

**Transparent printing, equality and manipulation**: Quotations consist of a sequence of instructions. This sequence can be printed, compared and manipulated.

**Effortless partial application**: To partially apply a function, write a quotation which pushes some of the parameters before calling a word.

```forth
[ 1 1 = ] .
\ [ 1 1 = ]

[ 1 + ] [ 2 * ] compose
\ [ 1 + 2 * ]

4 [ > ] curry .
\ [ 4 > ]

5 [ 1 + 2 * ] call .
\ 12
```

## Types
```haskell
data Val = Number Int
         | Bool Bool
         | Symbol String
         | Word { immediate :: Bool, wordType :: WordType }
         | Nil
         deriving (Eq)

data WordType = Primitive (Forth Val)
              | User [Val]
```

## Printing

```haskell
instance Show Val where
  -- ...
  show Word {wordType = User s} =
      showQuotation s

showQuotation :: Stack -> String
showQuotation s =
  "[" ++ unwords (map show s) ++ "]"
```

## Equality

```haskell
instance Eq WordType where
  User s == User z = s == z
  _ == _ = False
```

## Parsing
```haskell
exprs :: Parser [Val]
exprs = many expr

expr :: Parser Val
expr =
  between spaces spaces $ bool <|> word <|> number <|> quotation

quotation :: Parser Val
quotation = do
  char '['
  es <- exprs
  char ']'
  return $ makeWord es
```


## Eval
like other values: pushed, not invoked

```haskell
eval :: Val -> Forth ()
eval val = do
  state <- get
  case val of
    -- ...
    Word _ _ ->
      push val
    -- ...
```

## Call
```haskell
call = do
  q <- pop
  evalBody (wordBody q)
```


## Compose
```haskell
compose = do
  y <- pop
  x <- pop
  push $ makeWord (wordBody x ++ wordBody y)
```


## Curry


```haskell
curry' = do
  q <- pop
  x <- pop
  push $ makeWord (x : wordBody q)
```
