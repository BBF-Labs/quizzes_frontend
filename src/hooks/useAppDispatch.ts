import { TypedUseSelectorHook } from "react-redux";
import { RootState, AppDispatch } from "@/lib";
import { useDispatch, useSelector } from "react-redux";

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
