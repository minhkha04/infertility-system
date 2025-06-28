package com.emmkay.infertility_system_api.modules.authentication.strategy;

import com.emmkay.infertility_system_api.modules.authentication.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system_api.modules.authentication.enums.OAuthProvider;
import com.emmkay.infertility_system_api.modules.authentication.utils.UserValidationUtils;
import com.emmkay.infertility_system_api.modules.authentication.utils.UsernameUtils;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.shared.security.JwtProvider;
import com.emmkay.infertility_system_api.modules.user.entity.Role;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import com.emmkay.infertility_system_api.modules.user.repository.RoleRepository;
import com.emmkay.infertility_system_api.modules.user.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Optional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class GoogleOAuthStrategy implements OAuthStrategy{

    UserRepository userRepository;
    RoleRepository roleRepository;
    JwtProvider jwtProvider;


    @NonFinal
    @Value("${google.clientId}")
    String GOOGLE_CLIENT_ID;

    private GoogleIdToken.Payload verifyToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), JacksonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                    .build();
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }
            return idToken.getPayload();
        } catch (GeneralSecurityException | IOException e) {
            throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }
    }

    @Override
    public AuthenticationResponse handleLogin(String accessToken) {
            GoogleIdToken.Payload payload = verifyToken(accessToken);
            String name = (String) payload.get("name");
            String email = payload.getEmail();
            String picture = (String) payload.get("picture");
            Optional<User> existingUserOpt = userRepository.findByEmail(email);
            User user;
            if (existingUserOpt.isPresent()) {
                user = existingUserOpt.get();
                UserValidationUtils.validateUserIsActiveAndVerified(user);
            } else {
                Role role = roleRepository.findById("CUSTOMER")
                        .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
                user = User.builder()
                        .username(UsernameUtils.generateUsername(payload.get("given_name").toString()))
                        .fullName(name)
                        .email(email)
                        .isRemoved(false)
                        .password("")
                        .roleName(role)
                        .isVerified(true)
                        .avatarUrl(picture)
                        .build();
                userRepository.save(user);
            }
            String token = jwtProvider.generateToken(user);
            return AuthenticationResponse.builder()
                    .token(token)
                    .build();
        }

    @Override
    public OAuthProvider getProvider() {
        return OAuthProvider.GOOGLE;
    }
}
