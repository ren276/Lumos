import { Slide } from '@/lib/types'
import { Variable } from 'lucide-react'
import { create } from 'zustand'
import {persist} from 'zustand/middleware'

interface SlideState {
    slides: Slide[],
    setSlides: (slides:Slide[]) => void
}



export const useSlideStore = create(
    persist<SlideState>(
        (set,get)=> (
            {
        slides: [],
        setSlides:(slides: Slide[])=> set({slides}),
       

    }),{
        name: 'slides-storage', // name of the item in the storage (must be unique)
    }
)
)