---
title: Abstracting the Clojure def-macro pattern
tags: Clojure
---

Wrapping a function in a 'def-macro' is a common Clojure pattern.
This practice serves two purposes: providing a nicer syntax for definitions, and controlling evaluation order. Although simple to understand, this pattern is somewhat repetitive. Introducing: a higher-order macro that relieves this pain.

<!-- more -->

```clojure
(defmacro defserver [name & args]
 `(def ~name ~(apply run-server args)))
```

The example above uses httpkit's `run-server` function to define a `defserver` macro. With `defmacro<-`, it can be written as follows.

```clojure
(defmacro<- defserver run-server)

; Usage
(defserver server routes {:port 8080})
```

Implementation was a little tricky, because I had to keep track of two different compile-time execution contexts: defining a macro, and using that macro to define something.

```clojure
(defmacro defmacro<-
  ([f]
   (make-def-macro (def-sym f) f false))
  ([name f & [eval-after]]
   (make-def-macro name f eval-after)))

(defn def-sym [f-sym]
  (symbol (str "def" f-sym)))

```

Both normal and macro (eval-after) evaluation are supported, to accomodate for the two most common usecases.

```clojure
(defn make-def-macro [name f-sym eval-after?]
  `(defmacro ~name [name# & args#]
     (apply->intern ~f-sym name# args# ~eval-after?)))

(defn apply->intern [f name args eval-after?]
  (intern *ns* name
    (if eval-after?
      (eval (apply f args))
      (apply f (map eval args)))))
```

## Conclusion
This macro solved a common annoyance for me.
I hope you find it as useful as I do, and encourage you to replace some boilerplate with it.
