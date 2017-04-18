    Title: Eve: everything is a record
    Date: 2017-04-17T16:07:20
    Tags: Eve

A project I'm folowing with great interest is [Eve](http://witheve.com/). It's based on a single unifying principle: everything is a record. Today I'd like to explore some of the implications of this idea.

<!-- more -->

## Model
Eve's data model is based on records: a set of attribute/value pairs associated to an ID. 
This sounds very similar to Datomic to me.
Records are stored in databases, _which are records themselves_. 
Because everything is a record, Eve only needs a handful of operations that query and manipulate records.
This idea is similar to Smalltalk, where everything is an object and the universal operation is `send`.
See LispCast's [On Type Unity](http://www.lispcast.com/on-type-unity) for more.

Code is written in 'blocks', surrounded by prose.
Blocks are order independent, removing a whole layer of complexity.

The fundamental operations are `search`, `commit` and `bind`.
`search` pattern-matches on records in the given databases, and executes it's block for every succesful match.
`commit` adds new records to a database.
`bind` does the same, but updates it's earlier records when executed again (think React). 

```coffeescript
search @evernote
  [#note title
         tag: 'Recipes' 
         notebook: 'Web Clipper']

bind @trello
  [#card title
         list: 'Recipes'
         board: 'Inspiration']

commit @debug
  [#log 
         value: 'Found a new recipe: {{title}}']
```

## Implications
In Eve, side effects are described as data. 
This makes it easy to swap out alternative implementations for testing or development.
Because Eve is written in Javascript, all sorts of effects are accessible with minimal wiring.

While blocks seem to mutate stateful databases, making testing difficult, this doesn't necessarily have to be the case. 
It seems perfectly possible to test blocks by invoking them with a set of records, and verifying the resulting set of records.

Debugging is simple because all state is transparently visible.
Eve's IDE includes a `view` database, for effortless visualization.

Invariants can be enforced globally, reducing duplication.
Blocks can create error records, which can be handled in any way.

One thing I'm not yet certain about is the ability to define new operations.
Eve focuses on a single paradigm, but how does functional programming fit into this?
Function calls [desugar into records](http://docs.witheve.com/handbook/functions/), but what about function definitions?
Please let me know when you have a suggestion.

## Resources
For more information check out Eve's [website](http://witheve.com/), [blog](http://incidentalcomplexity.com/), or [documentation](http://docs.witheve.com/handbook/intro/).