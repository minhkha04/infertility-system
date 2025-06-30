package com.emmkay.infertility_system.modules.authentication.service;

import com.emmkay.infertility_system.modules.authentication.dto.response.AuthenticationResponse;
import com.emmkay.infertility_system.modules.authentication.enums.OAuthProvider;
import com.emmkay.infertility_system.modules.authentication.strategy.OAuthStrategy;
import com.emmkay.infertility_system.modules.authentication.strategy.OAuthStrategyFactory;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class OAuthLoginService {

    OAuthStrategyFactory oAuthStrategyFactory;

    public AuthenticationResponse login(OAuthProvider provider, String accessToken) {
        OAuthStrategy strategy = oAuthStrategyFactory.getStrategy(provider);
        return strategy.handleLogin(accessToken);
    }

}
