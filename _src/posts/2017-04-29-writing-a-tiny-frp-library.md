    Title: Writing a Tiny FRP Library
    Date: 2017-04-29T14:16:52
    Tags: Clojure, FRP

To gain a better understanding of how FRP might be implemented, I wrote a simple FRP library. 

<!-- more -->
```clojure
(def clicks      (atom nil))
(def click-count (reduce* (fn [acc x] (inc acc)) 0 clicks))
(def evens       (filter* even? click-count))
(def as-string   (map* str click-count))

(sub* evens
  (fn [count]
    (prn "Count is even:" count)))

(sub* as-string
  (fn [count]
    (prn "Count as string:" (str count))))
```

## Implementation
Implementation leans heavily on Clojure's atom watch functionality.
To support multiple watches on a "stream", `sub*` serializes it's function and turns it into a keyword. 

```clojure
(defn fn->keyword [f]
  (keyword (str f)))

(defn trigger* [xs & [event]]
  (reset! xs event))

(defn sub* [xs f]
  (add-watch xs (fn->keyword f)
    (fn [_ _ _ x]
      (f x))))
```

The basic operators take an atom, create and return a new one, and subscribe to changes on the original. When a new "event" occurs, they update the new atom with a transformed version of the event. On the surface, this gives the illusion of a pure "derivation" of streams.

```clojure
(defn map* [f xs]
  (let [ys (atom (f @xs))]
    (sub* xs #(reset! ys (f %)))
    ys))

(defn reduce* [f init xs]
  (let [acc (atom init)]
    (sub* xs #(swap! acc f %))
    acc))

(defn filter* [f xs]
  (let [ys (atom nil)]
    (sub* xs
      #(when (f %)
         (reset! ys %)))
    ys))

(defn union* [xs ys]
  (let [zs (atom nil)]
    (sub* xs #(reset! zs %))
    (sub* ys #(reset! zs %))
    ys))
```

## Limitations
Of course, nothing prevents you from calling `reset!` on a derived stream or computation. For a less leaky, more idiomatic Clojure solution, check out core.async's support for transducers.
