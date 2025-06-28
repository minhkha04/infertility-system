package com.emmkay.infertility_system_api.modules.authentication.strategy;

import com.emmkay.infertility_system_api.modules.authentication.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system_api.modules.authentication.enums.OAuthProvider;
import com.emmkay.infertility_system_api.modules.user.entity.User;

public interface OAuthStrategy {
    AuthenticationResponse handleLogin(String accessToken);
    OAuthProvider getProvider();
}
