package com.ipem.api.modules.user.service;

import com.ipem.api.modules.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService implements UserDetailsService  {

    private final UserRepository repository;

    public AuthenticationService(UserRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String registration) throws UsernameNotFoundException {
        return (UserDetails) repository.findByRegistrationAndIsActiveTrue(registration)
                .orElseThrow(() -> new UsernameNotFoundException("Registration not found or inactive: " + registration));
    }

    public boolean authenticate(String registration, String password) {
        return repository.findByRegistrationAndIsActiveTrue(registration)
                .map(user -> user.getPassword().equals(password))
                .orElse(false);
    }
}