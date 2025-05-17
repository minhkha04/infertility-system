package com.emmkay.infertility_system_api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    @PreAuthorize( "hasRole('ADMIN')")
    @GetMapping("/hello")
    public String hello() {
        String id = SecurityContextHolder.getContext().getAuthentication().getName();
        SecurityContextHolder.getContext().getAuthentication().getAuthorities().forEach(grantedAuthority ->
                System.out.println(grantedAuthority.getAuthority()));
        return "Hello " + id;
    }
}
