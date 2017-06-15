    Title: Writing a Forth: Quotations
    Date: 2017-06-15T16:00:35
    Tags: Writing a Forth, Haskell

Factor, another [Forth](http://reinvanderwoerd.nl/blog/2017/06/08/writing-a-forth/)-like language, introduces 'quotations' to the concatenative paradigm.

<!-- more -->

```forth
[ 1 1 = ] .
\ [ 1 1 = ]

[ 1 + ] [ 2 * ] compose .
\ [ 1 + 2 * ]

4 [ > ] curry .
\ [ 4 > ]

5 [ 1 + 2 * ] call .
\ 12
```

Quotations serve the same role as lambda's in other languages, but have a few key advantages:

- **Concatenation is composition**:
All expressions (including numbers) can be viewed as [functions from stack to stack](http://evincarofautumn.blogspot.nl/2012/02/why-concatenative-programming-matters.html). A program is a concatenation of these functions. This means common patterns can be written concisely.

- **Effortless partial application**:
To partially apply a function, write a quotation which pushes some of the parameters before calling a word. No additional syntax needed.

- **Transparent printing, equality and manipulation**:
Quotations are first-class values. They contain a sequence of instructions. This sequence can be printed, compared and manipulated.


```haskell
data Val = Number Int
         | Bool Bool
         | Symbol String
         | Word { immediate :: Bool,
                  wordType  :: WordType }
         | Nil
         deriving (Eq)


data WordType = Primitive (Forth Val)
              | User [Val]


instance Show Val where
  -- ...
  show Word {wordType = User stack} =
    "[ " ++ unwords (map show stack) ++ " ]"  


instance Eq WordType where
  User s == User z = s == z
  _ == _ = False
```

Brackets delimit a quotation.

```haskell
exprs :: Parser [Val]
exprs = many expr

expr :: Parser Val
expr = between spaces spaces $
  bool <|> word <|> number <|> quotation

quotation :: Parser Val
quotation = do
  char '['
  es <- exprs
  char ']'
  return $ makeWord es
```

They are evaluated like ordinary values: pushed on the stack, not invoked.

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

To call a quotation, evaluate it's body.

```haskell
call = do
  q <- pop
  evalBody (wordBody q)
```

To compose two quotations, concatenate their bodies.

```haskell
compose = do
  y <- pop
  x <- pop
  push $ makeWord (wordBody x ++ wordBody y)
```

To partially apply a quotation, add the second stack item to the front of it's body.

```haskell
curry' = do
  q <- pop
  x <- pop
  push $ makeWord (x : wordBody q)
```
