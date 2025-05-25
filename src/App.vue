<template>
  <PostsList
      @create="showCreateModal = true"
      @edit="openEditModal"
      @delete="confirmDelete"
      @bulk-delete="confirmBulkDelete"
  />
  <NewPost
    v-model="showCreateModal"
    :edit-data="editData"
    @create="handleCreate"
  />
</template>

<script setup>
import { ref } from 'vue'
import PostsList from '@/components/PostsList.vue'
import NewPost from '@/components/NewPost.vue'
import { createPost, getPosts, updatePost, deletePost } from '@/api/api'

const showCreateModal = ref(false)
const editData = ref(null)

function openEditModal(post) {
  editData.value = post
  showCreateModal.value = true
}

async function confirmDelete(id) {
  if (confirm('Are you sure?')) {
    try {
      await deletePost(id)
      await getPosts()
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }
}
async function confirmBulkDelete(selected) {
  if (confirm('Are you sure you want to delete all selected posts?')) {
    try {
      for (const id of selected) {
        await deletePost(id);
      }
      await getPosts()
    } catch (error) {
      console.error('Failed to delete posts:', error)
    }
  }
}

async function handleCreate(formData) {
  try {
    if (editData.value) {
      await updatePost(editData.value.id, formData)
    } else {
      await createPost(formData)
    }
    showCreateModal.value = false
    editData.value = null
    await getPosts()
  } catch (error) {
    console.error('Failed to save post:', error)
  }
}
</script>
