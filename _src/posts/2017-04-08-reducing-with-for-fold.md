    Title: Reducing with for-fold
    Date: 2017-04-08T15:42:31
    Tags: Clojure

Complicated _reduce_ algorithms are still tricky for me sometimes.
Clojure's _for_ makes _map_ more visual, which makes it easier for me to [engage my imagination](http://www.lispcast.com/interactive-baking). Racket extends this idea to reduce with _for/fold_.
Let's port it over to Clojure.

<!-- more -->

```clojure
(for-fold [sum 0 
           n (range 1 10)]
  (+ sum n)) ;=> 45
```

It works exactly like reduce:

1. The accumulator `sum` is initialized to the value `0`,
and `n` is initialized to the first element of `(range 1 10)`, which is `1`.

2. The body `(+ sum n)` is evaluated. In this case, it evaluates to `(+ 0 1)`, <br/> which is `1`.

3. `sum` is bound to the result of evaluating the body. `n` is bound to the next element in `(range 1 10)`. The body is evaluated again with these new bindings. 

4. Continue until the collection is empty, and return the last result (`45`).


Because the functionality is so similar, I'm using reduce to implement the macro. The biggest difference is the availability of the accumulator and element bindings within the body. Luckily, anonymous functions are all we need. By naming the `fn`'s parameters to the accumulator and element bindings, the bindings become available in the body. 

The initial accumulator and collection expressions are injected into the template, but are not evaluated yet.

```clojure
(defn- for-fold-impl [bindings body]
  (let [[[acc-sym init-expr] 
         [n-sym coll-expr]] (partition 2 bindings)]
    `(reduce
       (fn [~acc-sym ~n-sym] ~@body)
       ~init-expr
       ~coll-expr)))

(defmacro for-fold [bindings & body]
  (for-fold-impl bindings body))
```

The macro and it's implementation function are separated, because it makes it easier for me to verify that the resulting code is correct:

```clojure
(for-fold-impl '[sum 0 
                 n (range 1 10)]
  '(+ sum n))

; Expands to
(reduce 
    (fn [sum n] (+ sum n))
    0
    (range 1 10))
```

Can you see the similarity between the template and it's result?  <br/>
Enjoy your new macro! :)