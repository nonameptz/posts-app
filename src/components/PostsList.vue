<template>
  <div class="p-6">
    <div class="flex items-center mb-4">
      <div class="relative flex-1">
        <label for="search" class="sr-only">Search posts</label>
        <span class="absolute inset-y-0 left-0 flex items-center pl-3" aria-hidden="true">
          <svg
              class="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"
            />
          </svg>
        </span>
        <input
            id="search"
            type="search"
            v-model="search"
            placeholder="Search posts..."
            aria-label="Search posts"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
          @click="$emit('create')"
          class="ml-4 px-4 py-2 border border-blue-600 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Create new post
      </button>
    </div>

    <div role="region" aria-label="Posts list" class="border border-gray-200 rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full" aria-describedby="posts-table-description">
          <caption class="sr-only">List of posts with actions</caption>
          <thead class="bg-gray-100">
            <tr class="sticky top-0">
              <th scope="col" class="px-4 py-2 bg-gray-100 text-left">
                <input
                    type="checkbox"
                    aria-label="Select all posts"
                    class="form-checkbox h-4 w-4 text-blue-600"
                    @change="toggleSelectAll"
                    :checked="allSelected"
                    :indeterminate.prop="someSelected && !allSelected"
                />
              </th>
              <th scope="col" class="px-4 py-2 text-left bg-gray-100">Title</th>
              <th scope="col" class="px-4 py-2 text-left bg-gray-100">Description</th>
              <th scope="col" class="px-4 py-2 text-left bg-gray-100">Author</th>
              <th scope="col" class="px-4 py-2 bg-gray-100"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
                v-for="(post, index) in filteredPosts"
                :key="post.id"
                class="hover:bg-gray-50"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
            >
              <td class="px-4 py-2">
                <input
                    type="checkbox"
                    :aria-label="`Select post ${post.id}`"
                    class="form-checkbox h-4 w-4 text-blue-600"
                    :checked="isSelected(post.id)"
                    @change="toggleRow(post.id)"
                />
              </td>
              <td class="px-4 py-2">{{ post.title }}</td>
              <td class="px-4 py-2">{{ post.body.slice(0, 50) }}…</td>
              <td class="px-4 py-2">{{ users.byId[post.userId] || post.userId }}</td>
              <td class="px-6 py-2 text-right">
                <button
                    @click="toggleMenu(post.id)"
                    aria-label="Post actions"
                    aria-haspopup="true"
                    :aria-expanded="openMenuId === post.id"
                    class="p-1 hover:bg-gray-200 rounded-full cursor-pointer"
                >
                  <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M6 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"
                    />
                  </svg>
                </button>

                <div
                    v-if="openMenuId === post.id"
                    role="menu"
                    :aria-label="`Actions for ${post.title}`"
                    class="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-10"
                >
                  <button
                      @click="$emit('edit', post); toggleMenu(post.id);"
                      role="menuitem"
                      class="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                      @click="handleDelete(post.id); toggleMenu(post.id);"
                      role="menuitem"
                      class="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="selected.length" class="mt-4 flex justify-end space-x-2">
      <button
          @click="clearSelection"
          role="button"
          class="px-4 py-2 border rounded hover:bg-gray-100"
          aria-label="Clear selection"
      >
        Clear Selection
      </button>
      <button
          @click="deleteSelected"
          role="button"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          :aria-label="`Delete ${selected.length} selected posts`"
      >
        Delete Selected ({{ selected.length }})
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPosts } from '@/api/api'
import { useUsersStore } from '../stores/users'

const emit = defineEmits(['create','edit','delete','bulk-delete'])
const posts = ref([])
const search = ref('')
const openMenuId = ref(null)
const users = useUsersStore()
const selected   = ref([])

function emitCreate()       { emit('create') }
function emitEdit(post)     { emit('edit', post) }
function emitDelete(id)     { emit('delete', id) }
function emitBulkDelete(selected)     { emit('bulk-delete', selected) }

const filteredPosts = computed(() => {
    const searchTerm = search.value.toLowerCase()
    if (!searchTerm) return posts.value

    return posts.value.filter((p) => {
      const authorName = users.byId[p.userId]?.toLowerCase() || ''
      return p.title.toLowerCase().includes(searchTerm) ||
          p.body.toLowerCase().includes(searchTerm) ||
          authorName.includes(searchTerm)
    })
})

const allSelected  = computed(() =>
    filteredPosts.value.length > 0 &&
    filteredPosts.value.every(p => selected.value.includes(p.id))
)
const someSelected = computed(() =>
    filteredPosts.value.some(p => selected.value.includes(p.id))
)

function toggleSelectAll() {
  if (allSelected.value) {
    selected.value = []
  } else {
    selected.value = filteredPosts.value.map(p => p.id)
  }
}
function isSelected(id) {
  return selected.value.includes(id)
}
function toggleRow(id) {
  if (isSelected(id)) {
    selected.value = selected.value.filter(i => i !== id)
  } else {
    selected.value.push(id)
  }
}
function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id
}
function clearSelection() {
  selected.value = []
}
function deleteSelected() {
  posts.value = posts.value.filter(post => !selected.value.includes(post.id))
  emitBulkDelete([...selected.value])
  selected.value = []
}
function handleDelete(postId) {
  emitDelete(postId);
  posts.value = posts.value.filter(post => post.id !== postId)
  if (openMenuId.value === postId) {
    openMenuId.value = null
  }
  if (isSelected(postId)) {
    selected.value = selected.value.filter(id => id !== postId)
  }
}

async function fetchAll() {
  await users.fetchUsers()
  posts.value = await getPosts()
}

onMounted(fetchAll)
</script>

<style scoped>
.overflow-x-auto {
  max-height: 75vh;
  overflow-y: auto;
}
</style>
