<template>
	<div class="app-layout">
		<AppHeader v-if="isLoggedIn" />
		<main class="app-main">
			<slot />
		</main>
		<AppFooter />
	</div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import { useUserStore } from '../store/user.store';


const { isLoggedIn } = useUserStore()
</script>

<style scoped>
.app-layout {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
}

.app-main {
	flex: 1;
	padding: 2rem;
	box-sizing: border-box;
}
</style>
