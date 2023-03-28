import { viewPage } from "../views/views.js"
import { PAGES_IDS } from "../consts.js"
import * as api from "../services/services.js"


export const searchPageController = async (id = null) => {
    const response = await api.getAllItems()
    const data = await response.json()
    viewPage(PAGES_IDS.searchPage, data)
}


export const itemPageController = async (id) => {
    const response = await api.getItem(id)
    const data = await response.json()
    viewPage(PAGES_IDS.itemPage, data)
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

        return callback()
    }
    
    viewPage(PAGES_IDS.registerPage, { tryToRegister: tryToRegister })
}