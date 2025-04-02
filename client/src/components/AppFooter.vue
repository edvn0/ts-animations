<template>
	<footer class="app-footer">
		<span>© {{ year }} MyApp. All rights reserved.</span>
	</footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.app-footer {
	width: 100%;
	text-align: center;
	padding: 1rem;
	background-color: #f5f5f5;
	border-top: 1px solid #ccc;
	font-size: 0.9rem;
}
</style>
