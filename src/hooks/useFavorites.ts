import { useLocalStorage } from './useLocalStorage'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    LOCAL_STORAGE_KEYS.FAVORITES,
    []
  )

  const addToFavorites = (toolId: string) => {
    setFavorites(prev => {
      if (!prev.includes(toolId)) {
        return [...prev, toolId]
      }
      return prev
    })
  }

  const removeFromFavorites = (toolId: string) => {
    setFavorites(prev => prev.filter(id => id !== toolId))
  }

  const toggleFavorite = (toolId: string) => {
    if (favorites.includes(toolId)) {
      removeFromFavorites(toolId)
    } else {
      addToFavorites(toolId)
    }
  }

  const isFavorite = (toolId: string) => {
    return favorites.includes(toolId)
  }

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
  }
} 