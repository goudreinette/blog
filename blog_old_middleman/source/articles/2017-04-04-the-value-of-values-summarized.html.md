---
title: The Value of Values - Summarized
tags: [Values]
---

Rich Hickey's [The Value Of Values](https://www.infoq.com/presentations/Value-Values) is one of my favorite talks of all time. I highly recommend it, and it took me quite a while to understand all of it. Because I couldn't find a nice summary on the web, I decided to make my own.

<!-- more -->

## Values can be shared
* Share freely
    * aliases are free
* No one can mess you up
    * nor you them
* _Places_
    * defensive copy, clone, locks

## Reproducible results
* Operations on values are stable
* Reproduce failures without replicating state
    * testing
    * debugging
* _Places_
    * must establish matching ‘state’ first

## Easy to fabricate
* Anything can create compliant values
    * for testing, simulation
* _Places_
    * must emulate operational interface

## Thwart imperativeness
* Values refuse to help you program imperatively
    * that’s a feature
    * imperative code is inherently complex
* _Places_
    * encourage and require imperativeness

## Language independence
* Pure values are language independent
    * _the_ polyglot tool
* _Places_ are defined by language constructs (methods)
    * can be proxied, remoted, with much effort

## Values are generic
* Representations in any language
* Few fundamental abstractions
    * for aggregation (lists, maps, sets)
* _Places_
    * operational interface is specific
    * more code
    * poor reuse

## Values are the best interface
* For subsystems
    * can be moved
    * ported
    * enqueued
* _Places_
    * application, language and flow coupled

## Values aggregate
* Values aggregate to values
    * so all benefits accrue to compositions
* _Places_
    * combinations of places, what properties?
    * need new operational interface for aggregate

<!--
## Conveyance

## Perception

## Reduced coordination

## Information systems


## Facts

## Decision making-->
