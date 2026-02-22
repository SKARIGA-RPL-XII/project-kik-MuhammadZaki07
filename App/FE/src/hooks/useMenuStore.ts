import { create } from 'zustand'

interface MenuState {
  search: string
  category: string
  page: number
  setSearch: (val: string) => void
  setCategory: (val: string) => void
  setPage: (val: number) => void
  resetFilters: () => void
}

export const useMenuStore = create<MenuState>((set) => ({
  search: '',
  category: 'All',
  page: 1,
  setSearch: (val) => set({ search: val, page: 1 }),
  setCategory: (val) => set({ category: val, page: 1 }),
  setPage: (val) => set({ page: val }),
  resetFilters: () => set({ search: '', category: 'All', page: 1 }),
}))