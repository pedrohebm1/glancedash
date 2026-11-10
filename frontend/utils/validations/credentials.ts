interface signinCredentials {
    email: string,
    password: string
}

interface signupCredentials {
    username: string,
    email: string,
    password: string
}

const emailRegex = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$/i

const validateUsernameAndPassword = (data: signinCredentials) => {
    if (data.email && data.password) {
        if (!data.email.match(emailRegex)) return false;
        if (!(data.password.trim().length >= 8 && data.password.trim().length <= 25)) return false;

        return true
    }
}

export const validateSigninCredentials = (data: signinCredentials) => {
    return validateUsernameAndPassword(data);
}

export const validateSignupCredentials = (data: signupCredentials) => {
    const validateUserAndPass = validateUsernameAndPassword({ email: data.email, password: data.password })

    if (validateUserAndPass && (data.username.trim().length >= 5 && data.username.trim().length <= 12)) {
        return true
    }
    return false;
}