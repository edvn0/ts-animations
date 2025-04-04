<template>
	<header class="app-header" v-if="userStore.user">
		<span>Welcome, {{ userStore.user.name }}</span>
		<button @click="handleLogout">Logout</button>
	</header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGlobalToast } from '../composables/toast'
import { useUserStore } from '../store/user.store'

const userStore = useUserStore()
const router = useRouter()
const { success, error } = useGlobalToast()

const handleLogout = async () => {
	try {
		await userStore.logout()
		success('Logged out')
		await router.push({ name: 'login' })
	} catch {
		error('Logout failed')
	}
}
</script>

<style scoped>
.app-header {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem 2rem;
	background-color: #f5f5f5;
	border-bottom: 1px solid #ccc;
	box-sizing: border-box;
	position: sticky;
	top: 0;
	z-index: 1000;
}

button {
	padding: 0.5rem;
}
</style>
