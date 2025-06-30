package com.emmkay.infertility_system.modules.authentication.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "email_otp")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmailOtp {
    @Id
    @Size(max = 255)
    @Column(name = "email", nullable = false)
    private String email;

    @Size(max = 6)
    @NotNull
    @Column(name = "otp", nullable = false, length = 6)
    private String otp;

    @NotNull
    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

}