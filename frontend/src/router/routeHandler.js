
import { useRouter } from 'vue-router'

let router

const userList = [
    { role: 'physiotherapist', baseURL: '/home' },
    { role: 'patient', baseURL: '/home' },
    { role: 'admin', baseURL: '/admin' }
]

const push = (info) => {
    userList.forEach(user => {
        if (info.role == user.role && info.loggedIn) {
            router.push(user.baseURL)
        }
        if (!info || !info.loggedIn) {
            // Redirect to login page if no localstorage session
            router.push('/login')
        }
    })
}

export default {
    init: async (info) => {
        router = useRouter()
        return push(info)
    },

    push: (info) => { push(info) }
}
