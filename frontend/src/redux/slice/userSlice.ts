import { createSlice, PayloadAction } from "@reduxjs/toolkit";


// const storedUser = localStorage.getItem('user');


// const initialState={
//     user:storedUser?JSON.parse(storedUser):null
// }

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  // Add other fields from your userModel
}


interface UserState {
  userDatas: UserData | null;
}


const initialState: UserState = {
  userDatas: (() => {
    const storedData = localStorage.getItem("userDatas");
    if (storedData) {
      try {
        return JSON.parse(storedData) as UserData;
      } catch (error) {
        console.error("Failed to parse userDatas from localStorage:", error);
        return null;
      }
    }
    return null;
  })(),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<UserData>) => {
      state.userDatas = action.payload;
      localStorage.setItem("userDatas", JSON.stringify(action.payload));
    },
  },
});


export const {addUser} = userSlice.actions;

export default userSlice.reducer;