<template>
	<div class="app-layout">
		<AppHeader v-if="showHeader" />
		<main class="app-main">
			<slot />
		</main>
		<AppFooter />
	</div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const showHeader = computed(() => route.name !== 'login')
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
