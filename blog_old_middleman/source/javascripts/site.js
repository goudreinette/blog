/**
 * Analytics
 */
// (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
//     (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
//     m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
// })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
//
// ga('create', 'UA-94082535-1', 'auto');
// ga('send', 'pageview');
//

window.onload = function () {

    // staggerFrom(".spotlight .item", 100, "spotlight-in")

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


    /**
     * Day/night
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
}
