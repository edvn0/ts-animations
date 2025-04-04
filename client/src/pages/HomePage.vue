<template>
	<div class="home">
		<h1>Welcome</h1>
		<p>Name: {{ user?.name }}</p>
		<p>Email: {{ user?.email }}</p>
		<p>JSON: {{ JSON.stringify(user ?? {}) }}</p>
	</div>
</template>

<script setup lang="ts">
import { useUserStore } from '../store/user.store'

const { user } = useUserStore();
</script>
