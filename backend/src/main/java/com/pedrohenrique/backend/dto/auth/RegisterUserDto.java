package com.pedrohenrique.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record RegisterUserDto(@NotBlank @Size(min = 5, max = 12) String username, @Email @NotBlank String email, @Size(min = 8, max = 25) String password) {
    
}
