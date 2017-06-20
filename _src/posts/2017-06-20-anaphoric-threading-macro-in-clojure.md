    Title: Anaphoric Threading Macro in Clojure
    Date: 2017-06-20T10:50:02
    Tags: Clojure

_Replace this with your post text. Add one or more comma-separated
Tags above. The special tag `DRAFT` will prevent the post from being
published._

<!-- more -->


```clojure
(--> [1 2 3]
 (map inc _)
 (apply + _)
 (dec))) ; 8
```


## Implementation

```clojure
(defn underscore? [x]
  (= x '_))


(defn contains-underscore? [form]
  (if (list? form)
    (some contains-underscore? form)
    (underscore? form)))


(defn to-fn [form]
  (eval
    (cond
      (contains-underscore? form)
       `(fn [~'_] ~form)
      (list? form)
       `(fn [_#] (~(first form) _# ~@(rest form)))
      :else
        form)))


(defmacro --> [expr & forms]
  ((->> forms
    (map to-fn)
    (reverse)
    (reduce comp)) expr))

```
