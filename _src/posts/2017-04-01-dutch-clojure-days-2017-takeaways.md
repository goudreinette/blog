    Title: Dutch Clojure Days 2017
    Date: 2017-04-01T10:59:06
    Tags: Clojure

Last saturday I attended DCD '17.
Here's what I took away from it.

<!-- more -->

Due to travel time I came in at 11:00 AM, and didn't get to see the first two talks. I was especially interested in Generatively Testing User Interfaces, but thankfully Andreas Geffen Lundahl helped me out by pointing me in the right direction after the talks.

I'll add the other main talks during the coming week.

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

Marketa Adamova talked about using [Component]() to provide structure and manage state in her company's customer support application.
The application was previously implemented in Rails.
She and her team decided to move to Clojure because of the JVM (big data and NLP libraries), and stayed for everything else.
A complete rewrite was unnesecary, because Rails handled the user front-end just fine.

Rails has conventions for how to structure applications, but Clojure does not.
Clojure does provide the necessary tools to do so though, using Protocols, which she explained in detail.

Her team still struggled with managing state, however.
Component was their solution to this. It made it easy to discover dependencies using the system map,
provided great REPL integration and made testing simpler.
She warned against the initial complexity bump of describing a system map.
For smaller apps, [Mount]() may be a better fit,  she suggested.


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

I certainly learned a lot over the course of the day, and I look forward to going again next year.
For additions or corrections, please leave a comment below.
