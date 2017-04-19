    Title: Categories in OO: Functors
    Date: 2017-04-15T11:11:21
    Tags: PHP, Categories

Today I'm starting my series on categories in OO.
My goal is to explain these concepts to programmers who are already familiar with object-oriented programming, but new to functional programming.

<!-- more -->

I chose PHP for these examples because it's many students' first language in my country the Netherlands. I assume basic familiarity with concepts like first-class functions.

Let's start with Functors.

Think of a simple value, perhaps the string `"apple"`.
Now apply a function to it: 

```php
<?php
ucfirst("apple"); //=> "Apple"
```

Functors are contexts. They can contain any other value. Think of them like boxes. 

Functors allow you to apply a function to their value with the `fmap` method.
`fmap` takes a function, and applies it to the value inside the box.
Functors may also have an `of` method for construction. Functors with an `of` method are called 'pointed functors'.

```php 
<?php
abstract class Functor {
    function __construct ($value) {
        $this->value = $value;
    }

    static function of ($val) {
        return new static($val);
    }

    abstract function fmap(Closure $f);
}


class Box extends Functor {
    function fmap(Closure $f) {
        return Box::of($f($this->value));
    }
}
```

Let's try using it:

```php
<?php
$box = Box::of("apple")->fmap(function ($value) {
    return ucfirst($value);
});

$box->value; //=> "Apple"
```

Our `Box` isn't very useful yet, but serves as the foundation for what's to come. In this case, `fmap` simply applies the function to the value, but it can really execute any code "behind the scenes". By centralizing code within `fmap`, we can reduce duplication in client code.

A more realistic example is the `Maybe` type, commonly used to encapsulate an optional value. It's power lies in the ability to treat presence and absence of a value equally, relieving client code of the burden of checking for nulls all the time.

```php
<?php
class Maybe extends Functor {
    function fmap(Closure $f) {
        return $this->isNothing()
        ? Maybe::of(null)
        : Maybe::of($f($this->value));
    }

    function isNothing () {
        return $this->value === null;
    }
}
```

To demonstrate:

```php
<?php
function add3 (Maybe $maybe) {
    return $maybe->fmap(function ($n) {
        return $n + 3;
    });
}

// Null checking encapsulated:
add3(Maybe::of(null)); //=> Maybe(null)
add3(Maybe::of(5)); //=> Maybe(8)


$maybe = Maybe::of("text");


// To get the value back out again:
if (!$maybe->isNothing()) {
    doSomethingWith($just->value); 
}
```