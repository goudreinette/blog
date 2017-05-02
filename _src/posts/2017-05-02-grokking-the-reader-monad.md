    Title: Grokking the Reader Monad: a Visual Explanation
    Date: 2017-05-02T14:43:32
    Tags: Haskell

_I'm still figuring out the best way to present images on my blog._

<!-- more -->

[![data](/img/reader/data.png)](/img/reader/data.png)
[![flow](/img/reader/flow.png)](/img/reader/flow.png)
[![flow](/img/reader/monad.png)](/img/reader/ask.png)
[![flow](/img/reader/ask.png)](/img/reader/ask.png)

## Definition
```haskell
data Reader config result = Reader (config -> result)

runReader :: Reader config result -> config -> result
runReader (Reader f) config =
  f config

instance Monad (Reader config) where
  return x         = Reader $ \config -> x
  (Reader f) >>= g = Reader $ \config ->
      let x = f config
          y = runReader (g x) config 
      in  y

ask :: Reader config config
ask = Reader $ \config -> config
```