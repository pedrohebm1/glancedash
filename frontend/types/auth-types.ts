export interface AuthSigninRequest {
    email: string,
    password: string,
}

export interface AuthSignupRequest {
    username: string,
    email: string,
    password: string,
}

export interface AuthSigninResponse {
    token: string,
    expiresIn: string,
    userData: UserData
}

export interface AuthSignupResponse {
    token: string,
    expiresIn: string,
    userData: UserData
}

export interface UserData {
    userId: string,
    username: string,
    email: string
}