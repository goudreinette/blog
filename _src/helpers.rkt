#lang at-exp racket/base

(require (for-syntax racket/base)
         racket/string
         racket/function)

(provide (all-defined-out))

(define (date-and-tags date tags)
  @list{<p class='date-and-tags'>@date, in @|tags|</p>})

(define (hackernews item-id)
  @list{<div class="comments">Discussion on <a href="https://news.ycombinator.com/item?id=@item-id">HackerNews</a></div>})