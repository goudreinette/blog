$(() => {
    $('#nav-trigger').click(() => {
    //     $('html').toggleClass('menu-open')
    //     // staggerFrom("nav a", 100, "spotlight-in")
        if (location.pathname == "/bio/menu.html") {
            location.pathname = "/bio/"
        } else {
            location.pathname = "/bio/menu.html"
        }
    })

    $('#next-arrow').click(() => {
        $('body').addClass('slideout')
        setTimeout(() => {
            location.assign("/bio/highlights.html")
        }, 1000)
    })
})

