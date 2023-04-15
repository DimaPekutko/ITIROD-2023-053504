import { DEFAULT_IAMGE_SRC, PAGES_IDS } from "../consts.js"
import { changeLocation, setupLinksBindings } from "../router.js"
import { cartStore, userStore, viewHistoryStore } from "../store/store.js"
import { fileUploader } from "../helpers.js"

const pages = document.querySelectorAll('.page')

const hidePages = () => {
    for (const page of pages) {
        page.style.display = "none"
    }
}

const showPage = (page) => {
    page.style.display = "block"
}


const createHeaderView = () => {
    const header = document.getElementById("header")
    const loginLi = header.querySelector("#login_li")
    const regLi = header.querySelector("#register_li")
    const userLi = header.querySelector("#user_li")
    const navbar = header.querySelector(".navigation_bar")
    const burgerMenuBtn = header.querySelector("#burger_menu_btn")

    let burgerMenuOpened = false
    
    function onBurgerMenuTrigger(e) {
        e.stopPropagation()
        if (window.innerWidth < 1024) {
            navbar.style.display = "block"
            burgerMenuOpened = true
        }
    }

    function onBodyClick(e) {
        if (burgerMenuOpened) {
            navbar.style.display = "none"
            burgerMenuOpened = false
        }
    }
    
    document.body.onclick = onBodyClick
    burgerMenuBtn.onclick = onBurgerMenuTrigger

    return async function view() {
        const user = userStore.get()
        if (!user) {
            loginLi.style.display = "block"
            regLi.style.display = "block"
            userLi.style.display = "none"
        }
        else {
            loginLi.style.display = "none"
            regLi.style.display = "none"
            userLi.style.display = "block"
            userLi.querySelector("a").innerHTML = `Log out <i>${user.name}</i>`
            userLi.querySelector("a").href = "/logout"
        }

    }

}

const createSidebarVoew = () => {
    const sidebarList = document.getElementsByClassName("sidebar__list")[0]
    const ghostItem = sidebarList.querySelector("#ghost_item")

    function createItemNode(itemData) {
        const item = ghostItem.cloneNode(true)
        item.removeAttribute("id")

        item.querySelector("img").src = itemData.image_url
        item.querySelector("span").innerHTML = itemData.name
        item.querySelector("a").href = `/item/${itemData.id}`

        sidebarList.appendChild(item)
    }
    
    return async function view() {
        sidebarList.innerHTML = ""
        const items = viewHistoryStore.get()
        for (const item of items) {
            createItemNode(item)
        }
    }
}

const createSearchPageView = () => {
    const itemsList = document.getElementsByClassName("search__page_content__list")[0];
    const ghostItem = itemsList.querySelector("#ghost_item")
    const foundItemsHint = document.getElementById("found_items")
    const searchForm = document.getElementsByClassName("page__search_form_wrap")[0].querySelector("form")
    const searchInput = searchForm.querySelector("input")
    const searchSubmitBtn = searchForm.querySelector("button")


    function createItemNode(itemData) {
        const isUserItem = itemData.user_id === userStore.get()?.id
        const isItemInCart = cartStore.find(itemData.id)

        const item = ghostItem.cloneNode(true)
        item.removeAttribute("id")

        item.querySelector("h1").innerHTML = itemData.name
        item.querySelector("h2").innerHTML = itemData.category_name
        item.querySelector("p").innerHTML = itemData.description
        item.querySelector("a").href = "/item/"+itemData.id
        item.querySelector("img").src = itemData.image_url
        
        if (isItemInCart) {
            item.querySelector("#delete_from_cart").href = `/delete_from_cart/${itemData.id}`
            item.querySelector("#delete_from_cart").style.display = "block"            
            item.querySelector("#add_to_cart").style.display = "none"
        }
        else {
            item.querySelector("#add_to_cart").href = `/add_to_cart/${itemData.id}`
            item.querySelector("#add_to_cart").style.display = "block"
            item.querySelector("#delete_from_cart").style.display = "none"
        }

        if (isUserItem) {
            item.querySelector("#delete").style.display = "block"
            item.querySelector("#delete").href = `/delete_item/${itemData.id}`
            item.querySelector("#update").style.display = "block"
            item.querySelector("#update").href = `/editor/${itemData.id}`
            item.querySelector("#add_to_cart").style.display = "none"
            item.querySelector("#delete_from_cart").style.display = "none"
        }
        else {
            item.querySelector("#update").style.display = "none"
            item.querySelector("#delete").style.display = "none"
        }

        itemsList.appendChild(item)
    }

    return async function view(page, data) {
        itemsList.innerHTML = ""

        function onSubmit(e) {
            e.preventDefault()
            const formData = new FormData(searchForm)
            const payload = {
                query: formData.get("query").trim(),
            }
            data.search(payload, (foundItems) => view(page, {...data, items: foundItems}) | setupLinksBindings())
        }

        foundItemsHint.innerHTML = `Found ${data.items.length} items...`
        for (const itemData of data.items) {
            createItemNode(itemData)
        }

        searchSubmitBtn.onclick = onSubmit
    }
    
}


const createItemPageView = () => {
    return async function view(page, data) {
        const itemData = data[0]

        // const dropzone = new Dropzone("div.item__page_content__top_desc__img_wrap", {url: "fuck"})
        page.querySelector("h1").innerHTML = itemData.name
        page.querySelector("#cat").innerHTML = `Category: ${itemData.category_name}`
        page.querySelector("#subcat").innerHTML = `Sub category: ${itemData.subcategory_name}`
        page.querySelector("#owner").innerHTML = `${itemData.user_name}`
        page.querySelector("#views").innerHTML = `${itemData.views}`
        page.querySelector("img").src = itemData.image_url
        page.querySelector("#desc").innerHTML = itemData.description
        page.querySelector("button").onclick = (e) => alert("Just imagine, that you called to that shiny person...")

    }
}


const createItemEditorPageView = () => {
    const editorForm = document.getElementById("item_editor_form")
    const submitBtn = editorForm.querySelector("#save")
    const errorHint = editorForm.querySelector("#error")


    return async function view(page, data) {        
        page.querySelector("#title").value = data.item?.name ?? ""
        page.querySelector("#description").value = data.item?.description ?? ""
        
        const image = page.querySelector("img")
        console.log(data)
        image.src = data?.item?.image_url ?? DEFAULT_IAMGE_SRC
        
        const imageInput = page.querySelector("#image_upload_input")
        const catSelect = page.querySelector("#category")
        const subCatSelect = page.querySelector("#subcategory")

        catSelect.options.length = 0
        subCatSelect.options.length = 0

        errorHint.style.display = "none"

        async function imageChange(e) {
            errorHint.style.display = "block"
            try {
                const [ file ] = e.target.files
                const { fileUrl } = await fileUploader.uploadFile(file, { 
                    onProgress: ({ progress }) => {
                        errorHint.innerHTML = `loading image ${progress}%...`
                    }
                })
                image.src = fileUrl
                errorHint.style.display = "none"
            }
            catch (e) {
                errorHint.innerHTML = "Can not upload image"
            }
        }

        function catChange(e) {
            const catId = parseInt(catSelect.value)
            subCatSelect.options.length = 0

            for (const cat of data.categoriesTree) {
                if (cat.id === catId) {
                    for (const subcat of cat.subcats) {
                        subCatSelect.add(new Option(subcat.name, subcat.id))
                    }            
                    break
                }
            }    

        }

        function onValidated(error = null) {
            if (error) {
                errorHint.style.display = "block"
                errorHint.innerHTML = error
            }
        }
        
        function onSubmit(e) {
            e.preventDefault()
            const formData = new FormData(editorForm)
            const payload = {
                user_id: userStore.get().id,
                category_id: parseInt(formData.get("category")),
                subcategory_id: parseInt(formData.get("subcategory")),
                name: formData.get("title").trim(),
                price: 128,
                description: formData.get("desc").trim(),
                image_url: image.src,
            }
            
            if (!data.isCreationMode) {
                payload.id = data.item.id
            }

            data.save(payload, onValidated)   
        }

        let curCatId = 0
        for (const cat of data.categoriesTree) {
            if (!data.isCreationMode && data.item.category_name === cat.name) {
                curCatId = cat.id
            }
            catSelect.add(new Option(cat.name, cat.id))
        }

        imageInput.onchange = imageChange
        catSelect.onchange = catChange
        submitBtn.onclick  = onSubmit


        if (!data.isCreationMode) {
            catSelect.value = curCatId
            catSelect.dispatchEvent(new Event("change"))
            subCatSelect.value = data.item.subcategory_id
        }
    }
}


const createRegisterPageView = () => {
    const registerForm = document.getElementsByClassName("register_form")[0];
    const submitBtn = registerForm.querySelector("#submit")
    const errorHint = registerForm.querySelector("#error")

    return async function view(page, data) {

        function onValidated(error = null) {
            if (error) {
                errorHint.style.display = "block"
                errorHint.innerHTML = error
            }
        }
        
        function onSubmit(e) {
            e.preventDefault()
            const formData = new FormData(registerForm)
            const payload = {
                name: formData.get("name").trim(),
                email: formData.get("email").trim(),
                password: formData.get("password").trim(),
                repeatPassword: formData.get("repeat_password").trim(),
            }
            data.tryToRegister(payload, onValidated)   
        }
        
        errorHint.style.display = "none"
        submitBtn.onclick = onSubmit
        
    }

}


const createLoginPageView = () => {
    const loginForm = document.getElementsByClassName("login_form")[0];
    const submitBtn = loginForm.querySelector("#submit")
    const errorHint = loginForm.querySelector("#error")

    return async function view(page, data) {

        function onValidated(error = null) {
            if (error) {
                errorHint.style.display = "block"
                errorHint.innerHTML = error
            }
        }
        
        function onSubmit(e) {
            e.preventDefault()
            const formData = new FormData(loginForm)
            const payload = {
                email: formData.get("email").trim(),
                password: formData.get("password").trim(),
            }
            data.tryToLogin(payload, onValidated)   
        }
        
        errorHint.style.display = "none"
        submitBtn.onclick = onSubmit
        
    }

}

const HEADER_VIEW = createHeaderView()
const SIDEBAR_VIEW = createSidebarVoew()
const PAGES_VIEWS = {
    [PAGES_IDS.searchPage]: createSearchPageView(),
    [PAGES_IDS.itemPage]: createItemPageView(),
    [PAGES_IDS.itemEditorPage]: createItemEditorPageView(),
    [PAGES_IDS.registerPage]: createRegisterPageView(),
    [PAGES_IDS.loginPage]: createLoginPageView()
}


export const viewPage = (pageId, data) => {
    const page = document.getElementById(pageId)
    hidePages()
    showPage(page)


    HEADER_VIEW()
    SIDEBAR_VIEW()
    PAGES_VIEWS[pageId](page, data)
    setupLinksBindings()
}
