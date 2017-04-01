    Title: Dutch Clojure Days 2017
    Date: 2017-04-01T10:59:06
    Tags: Clojure

Last saturday I attended DCD '17.
Here's what I took away from it.

<!-- more -->

Due to travel time I came in at 11:00 AM, and therefore didn't get to see the first two talks. I was especially interested in Generatively Testing User Interfaces, but thankfully Andreas Geffen Lundahl was very helpful by pointing me in the right direction after the talks.

I only included the main talks for now, because they had the biggest lasting impact on me.

## [Building Hermetic Systems (without Docker)](https://www.slideshare.net/WilliamFarrell7/building-hermetic-systems-without-docker)
_By Will Farrell_

Will Farrell defined hermetic systems as _airtight_ and _pure_.
He pointed out that hermetic systems are an example of functional design thinking, with the usual benefits of ease of reasoning and testing, and the added benefit of consistency between machines and enviroments.

He went on to define two hermeticity leaks which were mostly new to me: the system clock and entropy.
As a potential solution he suggested creating separate random- and time services, injecting them as dependencies.

Another leak potentially worth fixing are external services and libraries. He gave an embedded elasticsearch server as an example.
Leiningen's Uberjar can also be used to bundle dependencies with your app.  

Not all hermeticity leaks may be worth fixing though. 
Hermeticity must be balanced with complexity and speed of development.
Electricity and the JVM were given as examples.



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