let currentUser: any = null

export const getSession = () => currentUser

export const setSession = (user: any) => {
  currentUser = user
}

export const clearSession = () => {
  currentUser = null
}