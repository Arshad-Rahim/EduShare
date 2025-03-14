import { createSlice } from "@reduxjs/toolkit";


const storedUser = localStorage.getItem('user');


const initialState={
    user:storedUser?JSON.parse(storedUser):null
}

const userSlice=createSlice({
    name:"user",
    initialState,
    reducers:{
        login:(state,action)=>{
            state.user = action.payload;
            localStorage.setItem("user",JSON.parse(state.user))
        }
    }
})


export const {login} = userSlice.actions;

export default userSlice.reducer;