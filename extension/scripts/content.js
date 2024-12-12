const button = document.createElement('button')
button.classList.add('tocalendar')

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@40,400,0,0&icon_names=calendar_add_on';


const icon = document.createElement('span');
icon.className = 'material-symbols-outlined';
icon.textContent = 'calendar_add_on';

button.insertBefore(icon, button.firstChild);

document.head.appendChild(link);
// Add a click event listener
button.addEventListener('click', () => {
    alert('Button clicked!');
})

const observer = new MutationObserver(() => {
    const element = document.querySelector('[data-testid="navigationBar"]');
    if (element) {
        element.firstChild.appendChild(button);
        observer.disconnect();
    }
});
console.log('cookies: ', document.cookie)
observer.observe(document.body, { childList: true, subtree: true });

