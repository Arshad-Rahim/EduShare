import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserState {
  userDatas: UserData | null;
}

const initialState: UserState = {
  userDatas: (() => {
    const storedData = localStorage.getItem('userDatas');
    if (storedData) {
      try {
        return JSON.parse(storedData) as UserData;
      } catch (error) {
        console.error('Failed to parse userDatas from localStorage:', error);
        return null;
      }
    }
    return null;
  })(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<UserData>) => {
      state.userDatas = action.payload;
      localStorage.setItem('userDatas', JSON.stringify(action.payload));
    },
    removeUser: (state) => {
      state.userDatas = null;
      localStorage.removeItem('userDatas');
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;

export default userSlice.reducer;
