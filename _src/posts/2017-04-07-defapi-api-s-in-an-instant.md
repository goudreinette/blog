    Title: defapi: API's in an instant
    Date: 2017-04-07T09:34:12
    Tags: Clojure, Web

Inspired by the ideas of Datascript and GraphQL, and frustrated by the boilerplate common in implementing API's, I set out to explore a possible solution.  

<!-- more -->

```clojure
(defapi portfolio-api sql-resolver
  :github github-resolver)
```



## Duplicating domain knowledge is a problem
- Understanding, cost of maintenance
- Schema is source of truth
- Backend models, migrations, procedural code in controllers, client-side js
- Excess filling in the cake
- Repetitive routes
- Users need access to their data with as little ceremony as possible

## Data DSL's
The goal was to let the client describe exactly the data it needs, and have the server figure out how to resolve it. Json itself was inadequate for this task, because I wanted to support named arguments, and disliked the resulting look.

Like GraphQL, I created a curly-braced dsl syntax for this implementation. I like the symmetry between the query and json response.

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
and the result still looked reasonably close. Credits to ... for this idea.
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
The API can provide unified access to multiple independent data sources, using _resolvers_. I included a SQL resolver. Other I possibilities can think of are other databases, external API's, state in memory, or an aggregate of these. 

I decided against multimethods in this case because I wanted to keep the relationship between query names and resolvers explicit.

```clojure
(defapi mixed-api db-resolver
  :user user-resolver
  :hits hitcount-resolver)
```



## Nesting and hydration
- Ommitted
- Namespacing by nesting
- Match on path


## Resources
- GraphQL (except more duplication?)
- [Decomposing web app development](http://tonsky.me/blog/decomposing-web-app-development/)
- (PostgREST)
- Andere blogpost

## Conclusion
View the [source](https://github.com/reinvdwoerd/defapi) on github.