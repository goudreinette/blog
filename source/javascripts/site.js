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
}
