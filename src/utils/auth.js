import request from '@/utils/request'

let loggingOut = false

export async function logoutAndRedirect(router) {
    if (loggingOut) return
    loggingOut = true

    if (!confirm('ログアウトしますか？')) {
        loggingOut = false
        return
    }

    try {
        await request.post('/auth/logout')
    } catch (_) {
        //
    } finally {
        const keys = [
            'token',
            'username',
            'permissionsLevel',
            'employeeId',
            'token_expires_at'
        ]
        keys.forEach(k => localStorage.removeItem(k))
        alert("ログアウトしました");
        if (router) router.replace('/login')
        else location.href = '/login'
        loggingOut = false
    }
}