import { ref } from 'vue'
import data from '@/assets/businessScopeMock.json'

export function useSearch({ handleAdd }) {
  const searchLoading = ref(false)
  const searchValues = ref([])
  const searchOptions = ref([])
  const searchQuery = ref('')

  const handleAddToStart = () => {
    console.log(...searchValues.value)
    if (searchValues.value.length === 0) return
    handleAdd([...searchValues.value], -Infinity)
    searchValues.value = []
  }

  const handleAddToEnd = () => {
    if (searchValues.value.length === 0) return
    handleAdd([...searchValues.value], Infinity)
    searchValues.value = []
  }

  const handleRemoteSearch = async (query) => {
    searchLoading.value = true
    if (query) {
      searchQuery.value = query
      await new Promise((res) => {
        setTimeout(() => {
          const matched = []

          data.forEach((item) => {
            let priority = -1
            let desc = ''
            let cutIndex = 0

            if (item.standardItem.includes(query)) {
              priority = 0
              cutIndex = item.gbName.indexOf(query) - 10
              desc =
                (cutIndex > 0 ? '...' : '') +
                item.gbName.substring(Math.max(0, cutIndex))
            } else if (item.gbName?.includes(query)) {
              priority = 1
              cutIndex = item.gbName.indexOf(query) - 10
              desc =
                (cutIndex > 0 ? '...' : '') +
                item.gbName.substring(Math.max(0, cutIndex))
            } else if (item.description?.includes(query)) {
              priority = 2
              cutIndex = item.description.indexOf(query) - 10
              desc =
                (cutIndex > 0 ? '...' : '') +
                item.description.substring(Math.max(0, cutIndex))
            }

            if (priority > -1) {
              matched.push({ name: item.standardItem, desc, priority })
            }
          })

          matched.sort((a, b) => a.priority < b.priority)
          searchOptions.value = matched
          res()
        }, 500 * Math.random())
      })
    } else {
      searchOptions.value = []
    }
    searchLoading.value = false
  }

  return {
    searchLoading,
    searchOptions,
    searchValues,
    searchQuery,
    handleAddToEnd,
    handleAddToStart,
    handleRemoteSearch,
  }
}
