package com.emmkay.infertility_system_api.modules.authentication.strategy;

import com.emmkay.infertility_system_api.modules.authentication.enums.OAuthProvider;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class OAuthStrategyFactory {

    List<OAuthStrategy> strategies;

    public OAuthStrategy getStrategy(OAuthProvider provider) {
        return strategies.stream()
                .filter(strategy -> strategy.getProvider() == provider)
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.UNSUPPORTED_OAUTH_PROVIDER));
    }
}
