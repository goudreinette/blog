    Title: Dutch Clojure Days 2017
    Date: 2017-04-01T10:59:06
    Tags: Clojure

Last saturday I attended DCD '17.
Here's what I took away from it.

<!-- more -->

Due to travel time I came in at 11:00 AM, and therefore didn't get to see the first two talks. I was especially interested in Generatively Testing User Interfaces, but thankfully Andreas Geffen Lundahl was very helpful by pointing me in the right direction after the talks.

I only included the main talks for now, because they had the biggest lasting impact on me.

## Building Hermetic Systems (without Docker)
_By Will Farrell_

- system clock as a dependency
    - shared app clock
- entropy: reproducing random
    - seeds
    - random service
- electricity, etc.
- uberjar
- embedding dependencies and services
    - github api
    - repl access

## Our Road Trip to Component
_By Marketa Adamova_ 

- Rails rewrite was unnecessary
- Convert piecemeal, using Clojure's strengths
    - jvm
    - data processing (in this case)
- mount: simpler to get started, but no system map


## Using Onyx in anger
_By Simon Belak_ 

- Data is code/code is data
    - Hammock
- Fast feedback and gradual learning curve by supporting local running

## From 0 to prototype using ClojureScript, re-frame and friends.
_By Martin Clausen_ 

- live prototyping can be impressive
- can you still charge as much?
    - "I know how much money this tool will save you"
    - Right/wrong, deal/no deal


## Conclusion

I certainly learned a lot over the course of the day, and look forward to next year. 