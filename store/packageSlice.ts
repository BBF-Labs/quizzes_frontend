import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Types } from "mongoose"

interface IPackage {
  _id: Types.ObjectId
  price: number
  name: string
  duration: number
  access: "quiz" | "course" | "duration" | "default"
  isUpgradable?: boolean
  numberOfCourses?: number
  courses?: Types.ObjectId[]
  numberOfQuizzes?: number
  quizzes?: Types.ObjectId[]
  discountCode?: string
  discountPercentage?: number
}

interface PackageState {
  packages: IPackage[]
  selectedPackage: IPackage | null
}

const initialState: PackageState = {
  packages: [],
  selectedPackage: null,
}

const packageSlice = createSlice({
  name: "package",
  initialState,
  reducers: {
    setPackages: (state, action: PayloadAction<IPackage[]>) => {
      state.packages = action.payload
    },
    setSelectedPackage: (state, action: PayloadAction<IPackage>) => {
      state.selectedPackage = action.payload
    },
  },
})

export const { setPackages, setSelectedPackage } = packageSlice.actions
export default packageSlice.reducer

