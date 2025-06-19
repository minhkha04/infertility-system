package com.emmkay.infertility_system_api.modules.payment.client;

import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoConfirmRequest;
import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoCreateRequest;
import com.emmkay.infertility_system_api.modules.payment.dto.response.MomoConfirmResponse;
import com.emmkay.infertility_system_api.modules.payment.dto.response.MomoCreateResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "momo-api", url = "${momo.endPoint}")
@Component
public interface MomoApi {

    @PostMapping("/create")
    MomoCreateResponse createMomoQr(@RequestBody MomoCreateRequest request);

    @PostMapping("/confirm")
    MomoConfirmResponse confirmMomoPayment(@RequestBody MomoConfirmRequest request);
}
