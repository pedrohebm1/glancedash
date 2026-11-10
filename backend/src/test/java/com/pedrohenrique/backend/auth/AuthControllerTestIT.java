package com.pedrohenrique.backend.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import com.pedrohenrique.backend.dto.auth.LoginUserDto;
import com.pedrohenrique.backend.dto.auth.RegisterUserDto;

import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthControllerTestIT {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createUserReturnOk() throws Exception {
        RegisterUserDto userData = RegisterUserDto.builder()
                .email("user@gmail.com")
                .username("user")
                .password("password123")
                .build();

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void loginUser() throws Exception {
        RegisterUserDto userData = RegisterUserDto.builder()
                .email("user@gmail.com")
                .username("user")
                .password("password123")
                .build();

        mockMvc.perform(post("/auth/register")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());

        LoginUserDto data = new LoginUserDto("user@gmail.com", "password123");

        mockMvc.perform(post("/auth/login")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(data)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());

    }

}