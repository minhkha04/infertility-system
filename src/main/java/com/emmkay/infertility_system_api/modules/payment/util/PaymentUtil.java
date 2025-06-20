package com.emmkay.infertility_system_api.modules.payment.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class PaymentUtil {

    public String getOrderId(Long recordId) {
        return "TR" + recordId + "-" + System.currentTimeMillis();
    }

    public long extractRecordId(String orderId) {
        String raw = orderId.replace("TR", "");
        int idx = raw.indexOf('-');
        String idPart = raw.substring(0, idx);
        return Long.parseLong(idPart);
    }


    public  String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {
                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP:" + e.getMessage();
        }
        return ipAdress;
    }
}
