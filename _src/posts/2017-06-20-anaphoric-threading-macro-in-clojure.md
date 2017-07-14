    Title: An Anaphoric Threading Macro
    Date: 2017-06-20T10:50:02
    Tags: Clojure

Clojure's threading macro's thread a value through either the first or last position.
Often, you want to insert the value at various different positions.
This macro, inspired by Alexis King's [threading](https://docs.racket-lang.org/threading/index.html) macro's in Racket, does just that.

<!-- more -->

```clojure
(--> [1 2 3]
 (map inc _)
 (apply + _)
 (/ _ 2))) ; 9/2
```


## Implementation

The macro transforms all forms to lambda's and composes them in reverse, creating a pipeline.

```clojure
(defmacro --> [expr & forms]
  ((->> forms
    (map to-fn)
    (reverse)
    (reduce comp)) expr))
```

The transformation process works as follows:
Forms containing an underscore are wrapped in a lambda whose single argument is named underscore (`_`).
For list forms without an underscore, the value is inserted as the first argument.
All non-list forms are left alone.

```clojure
(defn to-fn [form]
  (eval
    (cond
      (contains-underscore? form)
       `(fn [~'_] ~form)
      (list? form)
       `(fn [_#] (~(first form) _# ~@(rest form)))
      :else
        form)))


(defn contains-underscore? [form]
  (if (list? form)
    (some contains-underscore? form)
    (underscore? form)))


(defn underscore? [x]
  (= x '_))
```
