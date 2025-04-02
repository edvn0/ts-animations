<template>
	<header class="app-header" v-if="user">
		<span>Welcome, {{ user.name }}</span>
		<button @click="handleLogout">Logout</button>
	</header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import userService from '../services/user.service'
import { useGlobalToast } from '../composables/toast'

const user = ref<{ name: string; email: string } | null>(null)
const router = useRouter()
const { success, error } = useGlobalToast()

onMounted(async () => {
	try {
		user.value = await userService.getUserInformation()
	} catch {
		user.value = null
	}
})

const handleLogout = async () => {
	try {
		await userService.logout()
		success('Logged out')
		router.push({ name: 'login' })
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
