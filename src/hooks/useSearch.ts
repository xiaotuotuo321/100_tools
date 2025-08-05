import { useState, useEffect, useMemo } from 'react'
import { debounce } from '@/lib/utils'
import { searchTools } from '@/data/tools'
import { Tool } from '@/lib/types'

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // 创建防抖版本的设置函数
  const debouncedSetQuery = useMemo(
    () => debounce((query: string) => {
      setDebouncedQuery(query)
    }, 300),
    []
  )

  // 当搜索查询改变时，更新防抖查询
  useEffect(() => {
    debouncedSetQuery(searchQuery)
  }, [searchQuery, debouncedSetQuery])

  // 搜索结果
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return []
    }
    return searchTools(debouncedQuery)
  }, [debouncedQuery]) as Tool[]

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setDebouncedQuery('')
  }

  return {
    searchQuery,
    searchResults,
    updateSearchQuery,
    clearSearch,
    isSearching: searchQuery !== debouncedQuery,
  }
}
