---
title: 'Categories in OO: Monads'
tags:
    - PHP
    - Category Theory
---

Last time we used Maybe to encapsulate an optional value, performing operations on it while remaining ignorant of the actual presence of that value. Now we turn to the famous Monad, starting with an example that illustrates it's purpose.

<!-- more -->

What happens you give `fmap` a function that returns a Maybe too?

```php
<?php
$safeDivideBy = function ($n) {
    return function ($m) use ($n) {
        return Maybe::of($n === 0 ? null : $m / $n);
    };
};

Maybe::of(20)->fmap(safeDivideBy(2)); //=> Maybe(Maybe(10))
```
...You end up with two layers of context.
Monads solves this problem with a method called `join`.
`join` collapses two layers of context into one.

```php
<?php
Maybe::of(20)->fmap(safeDivideBy(2))->join(); //=> Maybe(10)
```

Because this pattern is very common in functional programming,
Monads also have a `chain` method that combines `fmap` and `join`.

```php
<?php
Maybe::of(20)
    ->chain(safeDivideBy(2)) // Maybe(10)
    ->chain(safeDivideBy(0)); //=> Maybe(null)
```

Let's see how the Maybe monad works:

```php
<?php
abstract class Monad extends Functor {
    abstract function join();
    abstract function chain(Closure $f);
}

class Maybe extends Monad {
    // ... fmap and isNothing ...
    function join() {
        return $this->isNothing()
        ? Maybe::of(null)
        : $this->value; // Or: Maybe::of($this->value->value)
    }

    function chain(Closure $f) {
        return $this->fmap($f)->join();
    }
}
```

Haskell uses the IO monad to perform side effects in purely functional way. It uses `chain` to sequence side effecting operations. In the case of IO, the monad's value is always a function. IO delays the impure action by capturing it in a function wrapper.

```php
<?php
$getUsername = (new IO(function () {
    return httpGet('https://api.github.com/users/octocat');
}))->chain(function ($user) {
    return $user['username'];
});

$getUsername->runIO(); //=> "Octocat"
```

IO can be implemented as follows:

```php
<?php
class IO extends Monad {
    static function of ($x) {
        return new IO(function () use ($x) {
            return $x;
        });
    }

    function __construct (Closure $f) {
        $this->runIO = $f;
    }

    function fmap (Closure $f) {
        // Just function composition
        return IO::of(function ($x) use ($f) {
            return $f($this->runIO($x));
        });
    }

    function join () {
        return IO::of(function () {
            return $this->runIO()->runIO();
        });
    }

    function chain (Closure $f) {
        return $this->fmap($f)->join();
    }
}

```

<!--Stay tuned for the next post in this series: Applicative Functors.-->
