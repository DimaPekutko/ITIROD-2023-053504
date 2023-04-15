import { viewPage } from "../views/views.js"
import { PAGES_IDS } from "../consts.js"
import * as api from "../services/services.js"
import { changeLocation } from "../router.js"
import { cartStore, userStore, viewHistoryStore } from "../store/store.js"


const getCategoriesTree = async () => {
    const cats = await (await api.getAllCategories()).json()
    const subcats = await (await api.getAllSubCategories()).json()

    for (const cat of cats) {
        const childs = []
        for (const subcat of subcats) {
            if (subcat.parent_id === cat.id) {
                childs.push(subcat)
            }
        }
        cat.subcats = childs
    }
    return cats
}


export const searchPageController = async (id = null, customItems = null) => {
    let items = []
    if (customItems) {
        items = customItems
    }
    else {
        const response = await api.getAllItems()
        items = await response.json()
    }

    async function search(payload, callback) {
        const found = []
        const q = payload.query
        for (const item of items) {
            if (
                item.name.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q)
            ) found.push(item)
        }
        callback(found)
    }
    
    viewPage(PAGES_IDS.searchPage, {items: items, search})
}

export const cartPageController = async (id = null) => {
    searchPageController(null, cartStore.get())
}


export const itemPageController = async (id) => {
    await api.newProductView({id})
    
    const response = await api.getItem(id)
    const data = await response.json()

    viewPage(PAGES_IDS.itemPage, data)
    viewHistoryStore.push(data[0])
}


export const addToCartController = async (id) => {
    const response = await api.getItem(id)
    const data = await response.json()
    cartStore.push(data[0])
    changeLocation("/home")
}


export const deleteFromCartController = async (id) => {
    cartStore.delete(id)
    changeLocation("/home")    
}


export const itemEditorPageController = async (id=null) => {
    if (!userStore.get()) {
        changeLocation("/login")
        return alert("For product creation you should be logged in")
    }

    const isCreationMode = id === null
    
    async function save(data, callback) {
        if (data.name.length < 5)
            return callback(`Title should contain at least 5 charachers.`)
        if (!data.category_id || !data.subcategory_id)
            return callback(`You should specify category and subcategory.`)
        if (data.description.length < 10)
            return callback(`Description should contain at least 10 charachers.`)

        const response = isCreationMode ? await api.createProduct(data) : await api.updateProduct(data)        
        if (!response.ok) {
            return callback(`Can not ${isCreationMode ? "create" : "update"} product.`)
        }

        changeLocation("/home")
    } 

    viewPage(PAGES_IDS.itemEditorPage, {
        item: id ? ( await (await api.getItem(id)).json() )[0] : null,
        categoriesTree: await getCategoriesTree(),
        save,
        isCreationMode
    })   
}


export const deleteItemController = async (id) => {
    const userId = userStore.get()?.id
    if (userId) {
        await api.deleteProduct({id, user_id: userId})
        viewHistoryStore.delete(id)
    }
    changeLocation("/home")
}


export const registerPageController = async (id = null) => {
    const MIN_LEN = 5 
    async function tryToRegister(data, callback) {
        if (data.name.length < MIN_LEN)
            return callback(`Name should contain at least ${MIN_LEN} charachers.`)
        if (data.email.length < MIN_LEN)
            return callback(`Email should contain at least ${MIN_LEN} charachers.`)
        if (data.password.length < MIN_LEN)
            return callback(`Password should contain at least ${MIN_LEN} charachers.`)
        if (data.password !== data.repeatPassword)
            return callback(`Passwords should be equal.`)
        
        const response = await api.register(data)
        const result = await response.json()
        
        if (!response.ok) {
            return callback("User already exists.")
        }

        userStore.set(result)
        cartStore.clear()
        changeLocation("/home")
    }
    
    viewPage(PAGES_IDS.registerPage, { tryToRegister: tryToRegister })
}


export const loginPageController = async (id = null) => {
    const MIN_LEN = 5
    async function tryToLogin(data, callback) {
        if (data.email.length < MIN_LEN)
            return callback(`Email should contain at least ${MIN_LEN} charachers.`)
        if (data.password.length < MIN_LEN)
            return callback(`Password should contain at least ${MIN_LEN} charachers.`)

        const response = await api.login(data)
        const result = await response.json()

        if (!response.ok) {
            return callback("User not found.")
        }

        userStore.set(result)
        cartStore.clear()
        changeLocation("/home")
    }

    viewPage(PAGES_IDS.loginPage, { tryToLogin: tryToLogin })
}

export const logoutController = async (id = null) => {
    userStore.remove()
    cartStore.clear()
    changeLocation("/home")
}