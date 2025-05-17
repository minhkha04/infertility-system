package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.AuthenticationRequest;
import com.emmkay.infertility_system_api.dto.request.IntrospectRequest;
import com.emmkay.infertility_system_api.dto.request.UserCreationRequest;
import com.emmkay.infertility_system_api.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system_api.dto.response.IntrospectResponse;
import com.emmkay.infertility_system_api.dto.response.UserResponse;
import com.emmkay.infertility_system_api.entity.Role;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.UserMapper;
import com.emmkay.infertility_system_api.repository.RoleRepository;
import com.emmkay.infertility_system_api.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    @NonFinal
    @Value("${jwt.signerKey}")
    String SIGNER_KEY;

    String generateToken(User user) throws JOSEException {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
        // Create JWT claims set
        JWTClaimsSet jwsClaimSet = new JWTClaimsSet.Builder()
                .subject(user.getId())
                .issuer("emkay.unaux.com")
                .issueTime(new Date())
                .expirationTime(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000))
                .claim("scope", user.getRoleName().getName())
                .claim("username", user.getUsername())
                .jwtID(UUID.randomUUID().toString())
                .build();
        Payload payload = new Payload(jwsClaimSet.toJSONObject());
        // Create JWS object
        JWSObject jwsObject = new JWSObject(jwsHeader, payload);
        // Sign the JWS object
        jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
        return jwsObject.serialize();
    }

    public AuthenticationResponse login(AuthenticationRequest request) throws JOSEException {
        // find user by username
        User user = userRepository.findByUsername((request.getUsername()))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        // check a user is active
        if (user.getIsRemoved()) {
            throw new AppException(ErrorCode.USER_NOT_ACTIVE);
        }
        // check a user's password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
           throw new AppException(ErrorCode.PASSWORD_ERROR);
        }
        return AuthenticationResponse.builder()
                .token(generateToken(user))
                .build();
    }

    public UserResponse register(UserCreationRequest request) {
        if (userRepository.existsByUsername((request.getUsername()))) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
        User user = userMapper.toUser(request);
        Role role = roleRepository.findById("CUSTOMER").orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        user.setRoleName(role);
        user.setIsRemoved(false);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return userMapper.toUserResponse(user);

    }

    public IntrospectResponse introspect(IntrospectRequest request) throws ParseException, JOSEException {
        SignedJWT signedJWT = SignedJWT.parse(request.getToken());
        boolean verified = signedJWT.verify(new MACVerifier(SIGNER_KEY.getBytes()));
        Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        return IntrospectResponse.builder()
                .valid(verified && expirationTime.after(new Date()))
                .build();
    }
}
