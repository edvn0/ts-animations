<template>
	<div class="home">
		<h1>Welcome</h1>
		<p>Name: {{ user?.name }}</p>
		<p>Email: {{ user?.email }}</p>
		<p>JSON: {{ JSON.stringify(user ?? {}) }}</p>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import userService from '../services/user.service'
import type { User } from '../models/user.type'
import { type ViewModel } from '../models/view.model.type'

const user = ref<ViewModel<User>>(null)

onMounted(async () => {
	try {
		user.value = await userService.getUserInformation()
	} catch {
		user.value = null
	}
})
</script>
