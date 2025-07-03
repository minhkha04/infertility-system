package com.emmkay.infertility_system.modules.shared.security;

import com.emmkay.infertility_system.modules.user.entity.User;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
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
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtProvider {

    @NonFinal
    @Value("${jwt.signerKey}")
    String SIGNER_KEY;

    public String generateToken(User user)  {
        try {
            JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
            // Create JWT claims set
            JWTClaimsSet jwsClaimSet = new JWTClaimsSet.Builder()
                    .subject(user.getId())
                    .issuer("techleaf.pro")
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
        } catch (JOSEException e) {
            throw new RuntimeException();
        }

    }

    public SignedJWT verifyToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            boolean verified = signedJWT.verify(new MACVerifier(SIGNER_KEY.getBytes()));
            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            boolean isValid = verified && expirationTime.after(new Date());
            if (!isValid) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            return signedJWT;
        } catch (JOSEException | ParseException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }
}
