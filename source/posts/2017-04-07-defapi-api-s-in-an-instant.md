    Title: defapi: API's in an instant
    Date: 2017-04-07T09:34:12
    Tags: Clojure, Web

Inspired by the ideas of Datascript and GraphQL, and frustrated by the boilerplate common in implementing API's, I set out to explore a possible solution.  

<!-- more -->

```clojure
(defapi portfolio-api sql-resolver
  :github github-resolver)

; Server started on port 8080...
(mount-api portfolio-api) 
```


The goal was to give users access to their data with as little ceremony as possible. By sending a composite query, multiple ajax requests can be reduced to one. No manual routing is required. And since the api is just a Ring handler, it can be perfectly integrated in existing web-apps.


## Data DSL's
In the GraphQL model, the client describes exactly the data it needs, and the server figures out how to resolve it.

GraphQL primarily uses an XML-like data structure, with names, attributes and children. Because I wanted to support named arguments, and disliked the resulting look, json was inadequate for the task. 

Like GraphQL, I used a curly-braced DSL syntax for this implementation. I like the symmetry between the query and json response.

```json
{ 
  users {
    id,
    name,
    email
  }
  
  posts(id: 1) {
    date,
    name
  }
}
```

The problem with this approach is that you lose all facilities of the client language for building queries from collections (like maps, vectors and sets).

Clojure's EDN supports arbitrary values in map keys, 
and the result still looked reasonably close. Credits to [Huey Petersen](http://hueypetersen.com/posts/2015/02/02/first-thoughts-on-graph-ql/) for this idea.
Unfortunately, It's much also less ubiquitous than json.

```clojure
{ 
  :users #{
    :id,
    :name,
    :email
  }
  
  [:posts :id 1] #{
    :date,
    :name
  }
}
```



## Multiple data sources
The API can provide unified access to multiple independent data sources, using _resolvers_. I already included a SQL resolver. Other I possibilities can think of are other databases, external API's, state in memory, or any aggregate of these. The default resolver can be overridden by providing a custom resolver for that query.

I decided against multimethods in this case because I wanted to keep the relationship between query names and resolvers explicit.

```clojure
(def hits (atom 0))

(defn hitcount-resolver [name attributes children]
  (swap! hits inc))

(defapi mixed-api db-resolver
  :hits hitcount-resolver)
```

```js
// Request
{ hits }

// Response
{ "hits": 1 }
```


## Nesting and hydration
Nested queries depend on the context of their parents, and are therefore namespaced. I chose not to implement hydration and nested queries yet.
This is a complex topic, and I'm not yet clear about the desired behaviours.


## Resources
GraphQL is well-known and already gaining populatrity.

Nikita Prokopov wrote two really interesting articles about realtime web architecture: [The web after tomorrow](http://tonsky.me/blog/the-web-after-tomorrow/) and [Decomposing web app development](http://tonsky.me/blog/decomposing-web-app-development).

You can view the [source](https://github.com/reinvdwoerd/defapi) of this project on github.