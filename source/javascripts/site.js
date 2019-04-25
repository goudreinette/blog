/**
 * Analytics
 */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-94082535-1', 'auto');
ga('send', 'pageview');

/**
 * Animsition
 */
$(document).ready(function() {
    // $(".animsition").animsition({
    //     inClass: 'in',
    //     outClass: 'out',
    //     inDuration: 400,
    //     outDuration: 200,
    //     linkElement: 'a:not(#switch-mode):not(#expand):not(.tab)'
    //
    // });
});



$(() => {
    /**
     * Mode select
     */
    let $html = document.body.parentNode
    let today = new Date()
    let mode = 'dark'

    if (today.getHours() > 8 && today.getHours() < 20) {
        mode = 'light'
    }

    console.log(today.getHours())

    if (!location.pathname.includes('/bio')) {
        $html.className = mode
    }
})



window.onload = function () {

    staggerFrom(".spotlight .item", 100, "spotlight-in")

    /**
     * Image gallery
     */
    $('article img').click(e => {
        var $activeImg = $('article img.active')
        if ($activeImg[0] == e.target) {
            $activeImg.removeClass('active')
            $('article').removeClass('has-active')
        } else if (!$activeImg) {
            $(e.target).addClass('active')
            $('article').addClass('has-active')
        } else if ($activeImg != $(e.target)) {
            $activeImg.removeClass('active')
            $(e.target).addClass('active')
            $('article').addClass('has-active')
        }
    })


    $('article').click(e => {
        if (e.target == $('.cont')[0]) {
            $('article img').removeClass('active')
            $('article').removeClass('has-active')
        }
    })
}




/**
 * Portfolio stagger
 */
function staggerFrom(selector, duration, c) {
    const elements = document.querySelectorAll(selector)
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.add(c)
        setTimeout(() => {
            elements[i].classList.remove(c)
            elements[i].classList.add("visible")
        }, (i + 1) * duration)
    }
}
