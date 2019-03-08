$(() => {
    $('img').click(e => {
        $(e.target).toggleClass('active')
    })
})