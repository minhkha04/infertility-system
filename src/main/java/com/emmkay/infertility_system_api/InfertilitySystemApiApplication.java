package com.emmkay.infertility_system_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class InfertilitySystemApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(InfertilitySystemApiApplication.class, args);
	}

}
