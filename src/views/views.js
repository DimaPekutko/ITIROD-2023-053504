import { PAGES_IDS } from "../consts.js"
import { changeLocation, setupLinksBindings } from "../router.js"

const pages = document.querySelectorAll('.page')

const hidePages = () => {
    for (const page of pages) {
        page.style.display = "none"
    }
}


const createSearchPageView = () => {
    const itemsList = document.getElementsByClassName("search__page_content__list")[0];
    const ghostItem = document.getElementById("ghost_item")
    const foundItemsHint = document.getElementById("found_items")

    function createItemNode(itemData) {
        const item = ghostItem.cloneNode(true)
        item.removeAttribute("id")

        item.querySelector("h1").innerHTML = itemData.name
        item.querySelector("h2").innerHTML = itemData.category_name
        item.querySelector("p").innerHTML = itemData.description
        item.querySelector("a").href = "/item/"+itemData.id
        item.querySelector("img").src = "assets/default_image.png"

        itemsList.appendChild(item)
    }

    return async function view(page, data) {
        itemsList.innerHTML = ""

        foundItemsHint.innerHTML = `Found ${data.length} items...`
        for (const itemData of data) {
            createItemNode(itemData)
        }
    }
    
}


const createItemPageView = () => {

    return async function view(page, data) {
        console.log(data)
        const itemData = data[0]

        page.querySelector("h1").innerHTML = itemData.name
        page.querySelector("#cat").innerHTML = `Category: ${itemData.category_name}`
        page.querySelector("#subcat").innerHTML = `Sub category: ${itemData.subcategory_name}`
        page.querySelector("#owner").innerHTML = `${itemData.user_name}`
        page.querySelector("img").src = "assets/default_image.png"
        page.querySelector("#desc").innerHTML = itemData.description
    }

}


const createRegisterPageView = () => {
    const registerForm = document.getElementsByClassName("register_form")[0];
    const submitBtn = registerForm.querySelector("#submit")
    const errorHint = registerForm.querySelector("#error")

    return async function view(page, data) {

        function onValidated(error = null) {
            if (error) {
                errorHint.innerHTML = error
            }
            else {
                registerForm.reset()
                changeLocation("/home")
            }
        }
        
        function onSubmit(e) {
            e.preventDefault()
            const formData = new FormData(registerForm)
            const payload = {
                name: formData.get("name"),
                email: formData.get("email"),
                password: formData.get("password"),
                repeatPassword: formData.get("repeat_password"),
            }
            data.tryToRegister(payload, onValidated)   
        }
        
        submitBtn.onclick = onSubmit
        
    }

}


const VIEWS = {
    [PAGES_IDS.searchPage]: createSearchPageView(),
    [PAGES_IDS.itemPage]: createItemPageView(),
    [PAGES_IDS.registerPage]: createRegisterPageView()
}


export const viewPage = (pageId, data) => {
    hidePages()
    const page = document.getElementById(pageId)
    page.style.display = "block"
    
    VIEWS[pageId](page, data)
    setupLinksBindings()
}
