let openMenu = document.getElementById('open-menu')
let nav = document.querySelector('nav')
let exitMenu = document.getElementById('exit-menu');

openMenu.addEventListener('click', () => {
    nav.classList.add('menu-btn');
})

exitMenu.addEventListener('click', () => {
    nav.classList.remove('menu-btn');
})
