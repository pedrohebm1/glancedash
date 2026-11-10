package com.pedrohenrique.backend.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pedrohenrique.backend.dto.auth.AuthenticationResponse;
import com.pedrohenrique.backend.dto.auth.LoginUserDto;
import com.pedrohenrique.backend.dto.auth.RegisterUserDto;
import com.pedrohenrique.backend.dto.auth.UserData;
import com.pedrohenrique.backend.model.user.User;
import com.pedrohenrique.backend.service.auth.AuthenticationService;
import com.pedrohenrique.backend.service.auth.JwtService;

import jakarta.validation.Valid;

@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private final JwtService jwtService;
    
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    public AuthenticationResponse generateResponse(String jwtToken) {
        return AuthenticationResponse.builder()
            .token(jwtToken)
            .expiresIn(jwtService.getExpirationTime())
            .build();
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@Valid @RequestBody RegisterUserDto registerUserDto) {
        User registeredUser = authenticationService.signup(registerUserDto);
        String jwtToken = jwtService.generateToken(registeredUser);

        AuthenticationResponse response = AuthenticationResponse.builder()
            .token(jwtToken)
            .expiresIn(jwtService.getExpirationTime())
            .userData(UserData.builder()
                .userId(registeredUser.getId())
                .email(registeredUser.getEmail())
                .username(registeredUser.getUsername())
                .build()
            ).build();


        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        User authenticatedUser = authenticationService.authenticate(loginUserDto);

        String jwtToken = jwtService.generateToken(authenticatedUser);

        AuthenticationResponse response = AuthenticationResponse.builder()
            .token(jwtToken)
            .expiresIn(jwtService.getExpirationTime())
            .userData(UserData.builder()
                .userId(authenticatedUser.getId())
                .email(authenticatedUser.getEmail())
                .username(authenticatedUser.getUsername())
                .build()
            ).build();


        return ResponseEntity.ok(response);
    }
}