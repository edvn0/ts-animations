import type { User } from '@models/user.type'
import tokenService, { validateToken } from '@services/token.service'
import userService from '@services/user.service'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
	const user = ref<User | null>(null)

	const isLoggedIn = computed(() => !!user.value)
	const token = computed(() => tokenService.get())

	async function fetchUser(): Promise<void> {
		if (!token.value || !validateToken(token.value)) {
			user.value = null
			return
		}
		try {
			user.value = await userService.getUserInformation()
		} catch {
			user.value = null
			tokenService.clear()
		}
	}

	async function login(email: string, password: string): Promise<void> {
		const newToken = await userService.login(email, password)
		if (!newToken) throw new Error('Login failed')
		await fetchUser()
	}

	async function logout(): Promise<void> {
		await userService.logout()
		user.value = null
	}

	return {
		user,
		isLoggedIn,
		fetchUser,
		login,
		logout
	}
})
