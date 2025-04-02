<template>
	<div class="login-page">
		<h1>Login</h1>
		<form @submit.prevent="handleLogin">
			<input v-model="email" type="email" placeholder="Email" required />
			<input v-model="password" type="password" placeholder="Password" required />
			<button type="submit">Login</button>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import userService from '../services/user.service'
import { useGlobalToast } from '../composables/toast';

const email = ref('')
const password = ref('')
const router = useRouter()
const { success, error } = useGlobalToast()

const handleLogin = async () => {
	try {
		await userService.login(email.value, password.value)
		success('Login successful')
		router.push({ name: 'home' })
	} catch (e) {
		error('Login failed')
	}
}
</script>

<style scoped>
.login-page {
	max-width: 400px;
	margin: 2rem auto;
	display: flex;
	flex-direction: column;
}

input {
	margin-bottom: 1rem;
	padding: 0.5rem;
}

button {
	padding: 0.5rem;
}
</style>
