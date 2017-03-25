#lang at-exp racket/base

(require (for-syntax racket/base)
         racket/string
         racket/function)

(provide (all-defined-out))


(define (date-and-tags date tags)
  @list{<p class='date-and-tags'>@date, in @|tags|</p>})