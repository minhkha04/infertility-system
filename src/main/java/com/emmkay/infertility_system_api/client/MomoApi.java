package com.emmkay.infertility_system_api.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "momo-api", url = "${momo.endPoint}")
public interface MomoApi {

    @PostMapping("/create")
    
}
