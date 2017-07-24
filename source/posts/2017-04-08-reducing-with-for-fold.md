---
title: Reducing with for-fold
tags: [Clojure]
---

Complicated _reduce_ algorithms are still tricky for me sometimes.
Clojure's _for_ makes _map_ more visual, which makes it easier for me to [engage my imagination](http://www.lispcast.com/use-your-imagination). Racket extends this idea to reduce with _for/fold_, and also supports reducing multiple collections. Let's port it over to Clojure.

<!-- more -->

```clojure
(for-fold [sum 0
           n (range 5 10)
           m (range 10 20)]
  (+ sum n m)) ;=> 95
```

It works exactly like reduce:

1. The accumulator `sum` is initialized to the value `0`,
and `n` is initialized to the first element of `(range 5 10)`, which is `5`.
Similarly, `m` is initialized to `10`.

2. The body `(+ sum n m)` is evaluated. In this case, it evaluates to `(+ 5 10)`, <br/> which is `15`.

3. `sum` is bound to the result of evaluating the body. `n` and `m` are bound to the next element in their collections. The body is evaluated again with these new bindings.

4. This continues until the collections are empty, and the last accumulator value (`95`) is returned.


Because the functionality is so similar, I'm using reduce to implement the macro. The biggest differences are the availability of the accumulator and element bindings within the body, and the support for multiple collections.

Luckily, an anonymous function is all we need. By naming the `fn`'s parameters to the accumulator and element bindings, the bindings become available in the body.

The initial accumulator and collection expressions are injected into the template, but are not evaluated yet. The collections are then zipped, to be destructured again within the anonymous function on each iteration.  


```clojure
(defmacro for-fold [bindings & body]
  (let [[[acc-sym init-expr] & coll-bindings] (partition 2 bindings)
        el-syms    (map first coll-bindings)
        coll-exprs (map second coll-bindings)]
    `(reduce
       (fn [~acc-sym [~@el-syms]] ~@body)
       ~init-expr
       (map vector ~@coll-exprs))))
```

Let's verify that the resulting code is correct:

```clojure
(macroexpand-1
  '(for-fold [frequencies {}
              char "hello world"]
     (update frequencies char (fnil inc 0))))


; Expands to
(reduce
 (fn [frequencies [char]]
    (update frequencies char (fnil inc 0)))
 {}
 (map vector "hello world"))

;=> {\h 1, \e 1, ...}
```

The symmetry between the template and it's result is another example where visual reasoning makes code easier to understand. Enjoy your new macro! :)
