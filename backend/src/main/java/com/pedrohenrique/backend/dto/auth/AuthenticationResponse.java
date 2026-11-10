package com.pedrohenrique.backend.dto.auth;

import lombok.Builder;

@Builder
public record AuthenticationResponse(String token, long expiresIn, UserData userData) {
}