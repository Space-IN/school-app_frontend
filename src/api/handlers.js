let handlers = {
    getAccessToken: async () => null,
    refreshTokens: async () => { throw new Error("refresh tokens not attached.") },
    onLogout: async () => {}
}

export function attachAuthHandlers(h) {
    handlers = { ...handlers, ...h }
}

export function getHandlers() {
    return handlers
}