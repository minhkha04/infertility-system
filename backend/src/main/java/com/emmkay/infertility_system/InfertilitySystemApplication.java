package com.emmkay.infertility_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@EnableFeignClients(basePackages = "com.emmkay.infertility_system.modules.payment.client")
public class InfertilitySystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(InfertilitySystemApplication.class, args);
    }
}
