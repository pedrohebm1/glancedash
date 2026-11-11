package com.pedrohenrique.backend.service.auth;

import java.util.List;
import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pedrohenrique.backend.dto.auth.LoginUserDto;
import com.pedrohenrique.backend.dto.auth.RegisterUserDto;
import com.pedrohenrique.backend.exceptions.EmailAlreadyInUseException;
import com.pedrohenrique.backend.model.user.User;
import com.pedrohenrique.backend.model.user.role.Role;
import com.pedrohenrique.backend.model.user.role.RoleName;
import com.pedrohenrique.backend.repository.RoleRepository;
import com.pedrohenrique.backend.repository.UserRepository;

@Service
public class AuthenticationService {
        private final UserRepository userRepository;

        private final PasswordEncoder passwordEncoder;

        private final RoleRepository roleRepository;

        private final AuthenticationManager authenticationManager;

        private final JwtService jwtService;

        public AuthenticationService(
                        UserRepository userRepository,
                        AuthenticationManager authenticationManager,
                        PasswordEncoder passwordEncoder,
                        RoleRepository roleRepository,
                        JwtService jwtService) {
                this.authenticationManager = authenticationManager;
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.roleRepository = roleRepository;
                this.jwtService = jwtService;
        }

        public User findUserByToken(String token) throws UsernameNotFoundException {
                String username = jwtService.extractUsername(token);

                User user = userRepository.findByEmail(username);

                if (user == null) throw new UsernameNotFoundException("User not found");

                return user;
        }

        public User signup(RegisterUserDto input) {
                Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                                .orElseThrow(() -> new IllegalStateException("ROLE_USER não encontrada"));

                if (userRepository.findByEmail(input.email()) != null) throw new EmailAlreadyInUseException();

                User user = User.builder()
                                .username(input.username())
                                .email(input.email())
                                .password(passwordEncoder.encode(input.password()))
                                .role(List.of(userRole))
                                .build();

                return userRepository.save(user);
        }

        public User authenticate(LoginUserDto input) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                input.email(),
                                                input.password()));

                User user = userRepository.findByEmail(input.email().toString());

                if (user == null) throw new UsernameNotFoundException("User not found");
                return user;
        }
}
