---
title:  ADT's in Clojure
tags: [Clojure]
---

After reading [Alexis King's post](https://lexi-lambda.github.io/blog/2015/12/21/adts-in-typed-racket-with-macros/) about ADT's in Typed Racket, I felt inspired to try the same thing in Clojure.

<!-- more -->
I conceived the following syntax, made slightly more Clojure-esque by starting with 'def'.

```clojure
(defdata UserId
  Anonymous
  (Registered id))

(case-of (Registered 1)
  Anonymous "anon"
  (Registered id) id))
```

Missing a case produces an compile-time error:

```clojure
(case-of (Registered 1)
  Anonymous "anon"))
  ;(Registered id) id))
```


      java.lang.Error: Missing: Registered


Since I'm unfamiliar with Typed Clojure, I chose not to typecheck the values inside the tags. This limit's their usefulness, but still allows me to check for missing or undefined patterns at compile time.

The first task was to find a way to create the data constructors, and figure out where to store the type information.
Since data declarations are non-extensible, I figured keeping a global registry was unnecessary. Instead, I embedded type information, including slots and other tags, into the values themselves.

I wanted to keep the syntax of declaration, construction and pattern matching constistent. Therefore, I wrapped core.match, and gave contructors the same name as their tags.
To improve syntax, I also made parens around tags without slots optional.

During the process, I came up with two useful macro's.
`when-message` takes pairs of conditions and messages, and produces a concatenation of the messages whose conditions are true. `ensure-with-descriptor` calls it's predicate and descriptor with the given values, and when the predicate fails, throws an error, using the descriptor's output as the error message.

Here is the full code:

```clojure
(ns sandbox.adt
  (:use clojure.data)
  (:require [clojure.core.match :refer [match]]
            [clojure.string :refer [join]]
            [sandbox.control-flow :refer [unless
                                          ensure-with-descriptor
                                          when-message]]))


(defn- tag-name [tag]
  (if (list? tag) (first tag) tag))

(defn- tag-slots [tag]
  (if (list? tag) (rest tag) []))

(defn- make-adt [name tags]
  {:name (str name)
   :tag-names (vec (map (comp str tag-name) tags))})


(defn- describe-slots-count [expected got]
  (str "Wrong number of args: " expected " slots, " got " args "))


(defn- make-tag-constructor [adt name slots]
  (fn [& vals]
    (ensure-with-descriptor = describe-slots-count (count slots) (count vals))
    {:slots (zipmap (vec (map keyword slots)) vals)
     :adt adt
     :tag (str name)}))


(defn- define-tag-constructor [adt name slots]
 `(def ~(symbol name)
       ~(make-tag-constructor adt name slots)))


(defn- transform-clauses [clauses]
  (apply concat
    (for [[tag then] (partition 2 clauses)
          :let [name  (tag-name tag)  
                slots (tag-slots tag)]]
      [[(str name) (vec slots)] then])))


(defn- tags-in-clauses [clauses]
  (for [[[tag & _]] (partition 2 clauses)]
    tag))


(defn- describe-difference [declared in-clauses]
  (let [[missing undefined _] (diff (set declared) (set in-clauses))]
   (when-message
      (not-empty missing)
      (str "Missing: " (join ", " missing))

      (not-empty undefined)
      (str "Undefined: " (join ", " undefined)))))


(defmacro defdata
 "Define a new ADT"
 [name & tags]
 `(do
    ~@(for [tag tags]
        (define-tag-constructor
          (make-adt name tags)
          (tag-name tag)
          (tag-slots tag)))))

(defmacro case-of [quoted-val & clauses]
  "Pattern-match on a ADT value"
  (let [{:keys [tag slots] {:keys [tag-names]} :adt} (eval quoted-val)
         clauses    (transform-clauses clauses)
         in-clauses (tags-in-clauses clauses)
         matchform  [tag (vec (vals slots))]]  
    (ensure-with-descriptor = describe-difference tag-names in-clauses)
    `(match ~matchform
        ~@clauses)))
```


None of this is idiomatic Clojure though, so if you're interested in a similar clojure.spec based solution, I recommend you check out [Lambda Island's post](https://lambdaisland.com/blog/25-09-2016-union-types).
