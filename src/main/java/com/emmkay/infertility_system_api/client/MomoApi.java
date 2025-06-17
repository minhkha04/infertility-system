package com.emmkay.infertility_system_api.client;

import com.emmkay.infertility_system_api.dto.request.MomoCreateRequest;
import com.emmkay.infertility_system_api.dto.response.MomoCreateResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "momo-api", url = "${momo.endPoint}")
@Component
public interface MomoApi {

    @PostMapping("/create")
    MomoCreateResponse createMomoQr(@RequestBody MomoCreateRequest request);
}
