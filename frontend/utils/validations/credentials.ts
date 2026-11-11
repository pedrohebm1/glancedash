interface signinCredentials {
    email: string,
    password: string
}

interface signupCredentials {
    username: string,
    email: string,
    password: string
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validateEmailAndPassword = (data: signinCredentials) => {
    if (data.email && data.password) {
        if (!data.email.match(emailRegex)) return false;
        if (!(data.password.trim().length >= 8 && data.password.trim().length <= 25)) return false;

        return true
    }
}

export const validateSigninCredentials = (data: signinCredentials) => {
    return validateEmailAndPassword(data);
}

export const validateSignupCredentials = (data: signupCredentials) => {
    const validateUserAndPass = validateEmailAndPassword({ email: data.email, password: data.password })
    console.log(data.email.match(emailRegex))
    if (validateUserAndPass && (data.username.trim().length >= 5 && data.username.trim().length <= 12)) {
        return true
    }
    return false;
}
