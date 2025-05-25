<template>
  <div
      v-if="modelValue"
      class="fixed inset-0 bg-black opacity-70 z-40"
      @click="$emit('update:modelValue', false)"
      aria-hidden="true"
  ></div>

  <div
      v-if="modelValue"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <div
        class="bg-white rounded-lg shadow-xl w-full max-w-md"
        @click.stop
        ref="modalRef"
    >
      <div class="flex items-center justify-between p-4 border-b">
        <h2 id="modal-title" class="text-xl font-semibold">
          {{ props.editData ? 'Edit Post' : 'Create New Post' }}
        </h2>
        <button
            @click="$emit('update:modelValue', false)"
            class="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close modal"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submit" class="p-4">
        <div class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">
              Title
              <span class="text-red-500" aria-hidden="true">*</span>
              <span class="sr-only">required</span>
            </label>
            <input
                id="title"
                v-model="form.title"
                type="text"
                required
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :aria-invalid="errors.title ? 'true' : undefined"
                :aria-describedby="errors.title ? 'title-error' : undefined"
            />
          </div>

          <div>
            <label for="body" class="block text-sm font-medium text-gray-700">
              Body
              <span class="text-red-500" aria-hidden="true">*</span>
              <span class="sr-only">required</span>
            </label>
            <textarea
                id="body"
                v-model="form.body"
                required
                rows="4"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :aria-invalid="errors.body ? 'true' : undefined"
                :aria-describedby="errors.body ? 'body-error' : undefined"
            ></textarea>
          </div>

          <div>
            <label for="author" class="block text-sm font-medium text-gray-700">
              Author
              <span class="text-red-500" aria-hidden="true">*</span>
              <span class="sr-only">required</span>
            </label>
            <select
                id="author"
                v-model="form.userId"
                required
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :aria-invalid="errors.userId ? 'true' : undefined"
                :aria-describedby="errors.userId ? 'author-error' : undefined"
            >
              <option value="">Select an author</option>
              <option
                  v-for="(name, id) in users.byId"
                  :key="id"
                  :value="Number(id)"
              >
                {{ name }}
              </option>
            </select>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
              type="button"
              @click="$emit('update:modelValue', false)"
              class="px-4 py-2 border rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Saving...</span>
            <span v-else>{{ props.editData ? 'Save Changes' : 'Create Post' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect, nextTick } from 'vue'
import { useUsersStore } from '../stores/users'

const props = defineProps({
  modelValue: Boolean,
  editData: Object
})

const emit = defineEmits(['update:modelValue', 'create'])
const users = useUsersStore()
const modalRef = ref(null)
const isSubmitting = ref(false)
const errors = ref({})

const form = ref({
  title: '',
  body: '',
  userId: ''
})

const resetForm = () => {
  form.value = {
    title: '',
    body: '',
    userId: ''
  }
  errors.value = {}
}

const handleTab = (e) => {
  if (!modalRef.value) return
  const focusable = modalRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusable = focusable[0]
  const lastFocusable = focusable[focusable.length - 1]

  if (e.shiftKey && document.activeElement === firstFocusable) {
    lastFocusable.focus()
    e.preventDefault()
  } else if (!e.shiftKey && document.activeElement === lastFocusable) {
    firstFocusable.focus()
    e.preventDefault()
  }
}

watchEffect(() => {
  if (props.modelValue) {
    document.addEventListener('keydown', handleTab)
    document.body.style.overflow = 'hidden'
    nextTick(() => {
      const firstInput = modalRef.value?.querySelector('input, select, textarea')
      firstInput?.focus()
    })
  } else {
    document.removeEventListener('keydown', handleTab)
    document.body.style.overflow = ''
    resetForm()
  }
})

watchEffect(() => {
  if (props.editData) {
    form.value = { ...props.editData }
  }
})

async function submit() {
  try {
    isSubmitting.value = true

    await emit('create', form.value)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Submit error:', error)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  if (!users.byId) {
    await users.fetchUsers()
  }
})
</script>
