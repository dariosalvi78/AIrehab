
const storage = window.localStorage

/**
 * get item from localstorage
 * @param {String} key 
 */
function getItem(key) {
    try {
        return JSON.parse(storage.getItem(key))
    } catch (err) {
        console.error(err)
    }
}

/**
 * set item in localstorage
 * @param {String} key 
 * @param {Object} data 
 */
function setItem(key, data) {
    return storage.setItem(key, JSON.stringify(data))
}

/**
 * remove item from storage
 * @param {String} key 
 */
function removeItem(key) {
    return storage.removeItem(key)
}

export default {
    getItem,
    setItem,
    removeItem
}
