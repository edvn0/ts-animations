<template>
	<AppLayout>
		<router-view />
	</AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './components/AppLayout.vue'
import { onMounted } from 'vue'
import { useUserStore } from './store/user.store'

const { fetchUser } = useUserStore()

onMounted(async () => {
	await fetchUser()
})

</script>

<style lang="scss">
html,
body {
	margin: 0;
	padding: 0;
	height: 100%;
	box-sizing: border-box;
}

*,
*::before,
*::after {
	box-sizing: inherit;
}
</style>
