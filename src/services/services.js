const API_URL = `http://localhost:6969`


export const getItem = async (id) => {    
    return await fetch(
        `${API_URL}/product/${id}`,
        { method: "GET" }
    )
}


export const getAllItems = async () => {
    return await fetch(
        `${API_URL}/products`,
        { method: "GET" }
    )
}


export const register = async (payload) => {
    return await fetch(
        `${API_URL}/register?${new URLSearchParams(payload)}`,
        { method: "POST" }
    )
}