export function setupRequestInterceptor(api, getHandlers) {
    api.interceptors.request.use(
        async (config) => {
            try {
                const token = await getHandlers().getAccessToken()
                if(token) {
                    config.headers = config.headers || {}
                    config.headers.Authorization = `Bearer ${token}`
                }
                return config
            } catch(err) {
                return config
            }
        },
        (err) => Promise.reject(err)
    )
}