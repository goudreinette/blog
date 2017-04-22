    Title: Implementing Pause with a Free Monad
    Date: 2017-04-22T15:29:56
    Tags: Haskell

Adapted from FPComplete's [article](https://www.schoolofhaskell.com/school/to-infinity-and-beyond/pick-of-the-week/coroutines-for-streaming/part-1-pause-and-resume) on coroutines and streaming.

<!-- more -->
## Example
```haskell
main :: Pause String
main = do
  putF "Step 1"        -- Free (IO ())
  pause                -- Pure ()
  putF "Step 2"
  pause
  Free $ do            -- Free (IO String)
    putStrLn "Step 3"  -- IO ()
    putStrLn "Done!"
    return "All done." -- IO String

runN 2 main
-- Step 1
-- Step 2

fullRun main
-- Step 1
-- Step 2
-- Step 3
-- Done!
```


## Implementation
```haskell
module Pause where

import Control.Monad.Free

type Pause = Free IO

pause, putF :: Pause ()
pause = Pure ()
putF = Free . putStrLn

runN :: Int -> Pause a -> IO (Pause a)
runN 0 p        = return p
runN _ (Pure r) = return $ Pure r
runN n (Free m) = m >>= runN (n - 1)

fullRun :: Pause a -> IO a
fullRun (Pure r) = return r
fullRun (Free m) = m >>= fullRun
```