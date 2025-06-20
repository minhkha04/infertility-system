package com.emmkay.infertility_system_api.modules.payment.strategy;

import java.io.UnsupportedEncodingException;

public interface PaymentStrategy {

    String createPayment(Object request, Long recordId) throws UnsupportedEncodingException;

    boolean handleIpn(Object object);

    String getPaymentMethod();

    String reloadPayment(Object request, Long recordId);
}
