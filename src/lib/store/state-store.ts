import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { authReducer, quizReducer, paymentReducer } from "../reducers";

const PersistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "quiz"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  quiz: quizReducer,
  payment: paymentReducer,
});

const store = configureStore({
  reducer: persistReducer(PersistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
