export type TUserRegister ={
    name:string,
    email:string,
    password:string,
    role:string
}

export type TEmail = {
    email:string
}


export type TUserLogin ={
    email:string,
    password:string,
}


export type TOtpVerify={
    email:string,
    otp:number
}


export type TUserModel = {
    name:string,
    email:string,
    password:string,
    role:string
}