const API_URL = `http://localhost:6969`


export const getItem = async (id) => {    
    return await fetch(
        `${API_URL}/product/${id}`,
        { method: "GET" }
    )
}


export const getAllItems = async () => {
    let res = await fetch(
        `${API_URL}/products`,
        { method: "GET" }
    )
    return res
}


export const register = async (payload) => {
    return await fetch(
        `${API_URL}/register?${new URLSearchParams(payload)}`,
        { method: "POST" }
    )
}


export const login = async (payload) => {
    return await fetch(
        `${API_URL}/login?${new URLSearchParams(payload)}`,
        { method: "POST" }
    )
}


export const getAllCategories = async () => {
    return await fetch(
        `${API_URL}/categories`,
        { method: "GET" }
    )
}


export const getAllSubCategories = async () => {
    return await fetch(
        `${API_URL}/subcategories`,
        { method: "GET" }
    )
}


export const createProduct = async (payload) => {
    return await fetch(
        `${API_URL}/user/${payload.user_id}/products`,
        { 
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST", 
            body: JSON.stringify(payload) 
        }
    )
}


export const newProductView = async (payload) => {
    return await fetch(
        `${API_URL}/product/${payload.id}/view`,
        { method: "POST" }
    )
}


export const deleteProduct = async (payload) => {
    return await fetch(
        `${API_URL}/user/${payload.user_id}/products/${payload.id}`,
        { method: "DELETE" }
    )
}


export const updateProduct = async (payload) => {
    return await fetch(
        `${API_URL}/user/${payload.user_id}/products/${payload.id}`,
        { 
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT", 
            body: JSON.stringify(payload) 
        }
    )
}