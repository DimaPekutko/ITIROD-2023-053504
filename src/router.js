import { searchPageController, itemPageController, registerPageController } from "./controllers/controllers.js"


const ROUTES = {
    'home': searchPageController,
    'item': itemPageController,
    'register': registerPageController,
    // '/item/{id}': itemPageController 
}



export const changeLocation = (location) => {
    // window.history.pushState({}, location, location)
    const page = location.split("/")[1]
    const id = location.split("/")[2]
    if (page in ROUTES) {
        ROUTES[page](id)
    }
}

export const setupLinksBindings = () => {
    const links = document.getElementsByTagName("a")
    for (const link of links) {
        link.onclick = (event) => {
            changeLocation(link.getAttribute("href"))
            event.preventDefault()
        }
    }
}


export const initRouter = () => {
    setupLinksBindings()
    changeLocation("/register")
}