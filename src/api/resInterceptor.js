let isRefreshing = false
let requestQueue = []

function queueRequest(callback) {
    return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject, callback })
    })
}

function processQueue(err, token=null) {
    requestQueue.forEach(p => {
        if(err) p.reject(err)
        else p.resolve(token)
    })
    requestQueue = []
}



export function setupResponseInterceptor(api, getHandlers) {
    api.interceptors.response.use(
        (res) => res,

        async (err) => {
            const originalRequest = err.config
            const handlers = getHandlers()

            if(err.response?.status !== 401) { return Promise.reject(err) }
            if(originalRequest._retry) {
                await handlers.onLogout()
                return Promise.reject(err)
            }
            
            originalRequest._retry = true
            if(isRefreshing) {
                return queueRequest((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return api(originalRequest)
                })
            }

            isRefreshing = true
            try {
                const newAccessToken = await handlers.refreshTokens()
                processQueue(null, newAccessToken)

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return api(originalRequest)
            } catch(err) {
                processQueue(err, null)
                await handlers.onLogout()
                return Promise.reject(err)
            } finally {
                isRefreshing = false
            }
        }
    )
}