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
    $(".animsition").animsition({
        inClass: 'in',
        outClass: 'out',
        inDuration: 400,
        outDuration: 200,
        linkElement: 'a:not(#switch-mode)'
    });
});



/**
 * Mode select
 */
let mode = localStorage.getItem('mode') || 'dark'
let otherMode = mode == 'dark' ? 'light' : 'dark'
$html = document.body.parentNode
$html.className = mode


window.onload = function () {
    $switchLink = document.querySelector('a#switch-mode')
    $switchLink.innerText = otherMode
    $switchLink.onclick = switchMode
    $switchLink.ontouch = switchMode

    function switchMode() {
        // Swap 
        var temp = otherMode
        otherMode = mode
        mode = temp

        // Set
        localStorage.setItem('mode', mode)
        $html.className = mode
        $switchLink.innerText = otherMode
    }

    staggerFrom(".spotlight .item", 100, "spotlight-in")

    /**
     * Image gallery
     */
    $('article img').click(e => {
        var $activeImg = $('article img.active')

        if ($activeImg[0] == e.target) {
            $activeImg.removeClass('active')
        } else if (!$activeImg) {
            $(e.target).addClass('active')
        } else if ($activeImg != $(e.target)) {
            $activeImg.removeClass('active')
            $(e.target).addClass('active')
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


customElements.define('layout', class extends HTMLElement {
    constructor () {
        super()
        const shadowRoot = this.attachShadow({ mode: "open" })
        shadowRoot.innerHTML = `
            
        `
    }
})