package com.pedrohenrique.backend.exceptions;

public class EmailAlreadyInUseException extends RuntimeException {
    public EmailAlreadyInUseException() {
        super("The email is already in use");
    }
}
