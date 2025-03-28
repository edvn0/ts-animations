<script setup lang="ts">
import { ref, onMounted } from 'vue'
import httpService from '../services/http.service'
import userService from '../services/user.service';

defineProps<{ msg: string }>()

const count = ref(0)

onMounted(async () => {
  try {
    const users = await httpService.get<any[]>('/v1/users')
    const users1 = await httpService.get<any>('/v2/users/1')
    const userFromUserService = await userService.getUsers();
    console.log('Users:', users, users1, userFromUserService)
  } catch (error) {
    console.error('Error fetching users:', error)
  }
})
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
