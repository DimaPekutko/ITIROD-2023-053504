
function UserStore() {
    const STORAGE_KEY = "user"
    let cachedUserData = localStorage.getItem(STORAGE_KEY)
    let _user = JSON.parse(cachedUserData)

    return {
        get: () => _user,
        set: (user) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
            _user = user
        },
        remove: () => {
            _user = null
            localStorage.removeItem(STORAGE_KEY)
        }
    }

}


function ViewHistoryStore() {
    const SIZE = 3
    let items = []

    return {
        push: (item) => {
            if (items.length === SIZE) items.pop()
            items.unshift(item)
        },
        get: () => [...items],
        delete: (id) => {
            items = items.filter((item) => parseInt(item.id) !== parseInt(id))
        }

    }
}


function CartStore() {
    let items = []

    return {
        push: function(item) {
            if (!this.find(item.id))
                items.unshift(item)
        },
        get: () => [...items],
        find: (id) => {
            return items.find((item) => parseInt(item.id) === parseInt(id))
        },
        delete: (id) => {
            items = items.filter((item) => parseInt(item.id) !== parseInt(id))
        },
        clear: () => {
            items = []
        }
    }
}


export const userStore = UserStore()
export const viewHistoryStore = ViewHistoryStore()
export const cartStore = CartStore()