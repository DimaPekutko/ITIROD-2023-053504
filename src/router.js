import { searchPageController, itemPageController, registerPageController, loginPageController, logoutController, itemEditorPageController, deleteItemController, cartPageController, addToCartController, deleteFromCartController } from "./controllers/controllers.js"


const ROUTES = {
    'home': searchPageController,
    'cart': cartPageController,
    'item': itemPageController,
    'editor': itemEditorPageController,
    'delete_item': deleteItemController,
    'add_to_cart': addToCartController,
    'delete_from_cart': deleteFromCartController,
    'register': registerPageController,
    'login': loginPageController,
    'logout': logoutController
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
    changeLocation("/home")
}