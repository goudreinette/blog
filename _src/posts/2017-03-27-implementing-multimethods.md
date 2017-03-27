    Title: Implementing Multimethods
    Date: 2017-03-27T14:37:58
    Tags: Clojure



<!-- more -->

First, we will need a way to store the method implementations.
The method registry is state, which we can store in an atom.
By using a private definition, we can encapsulate this state inside the namespace.

```clojure
(ns sandbox.multi-impl
 (:refer-clojure :exclude [defmethod defmulti methods]))

(declare multi-fn)

(def-methods (atom {}))
```

Next up is multimethod defition.
`defmulti` creates a new entry in the methods map, and defines the actual multimethod.

```clojure
(defmacro defmulti [name dispatch-fn]
  (swap! multimethods assoc name {})
 `(def ~name ~(multi-fn name (eval dispatch-fn))))
```

When the multimethod is called, it first determines the dispatch value   
by calling it's dipatch function. It then looks up the method implementation for the dispatch value in the methods map.
When a matching implementation is found, the multimethod applies it to it's arguments. Otherwise, it throws an error. 

```clojure
(defn multi-fn [name dispatch-fn]
  (fn [& args]
    (let [dispatch-val (apply dispatch-fn args)
          method-impl  (get-in @multimethods [name dispatch-val])]
     (if method-impl
       (apply method-impl args)
       (throw (Error. (str "No implementation of " name " for " dispatch-val)))))))
```

`defmethod` simply adds a function to the methods map under the given name and dispatch value.

```clojure
(defmacro defmethod [name dispatch-val params & body]
  (swap! multimethods assoc-in [name dispatch-val]
    (eval `(fn [~@params]
             ~@body))))
```