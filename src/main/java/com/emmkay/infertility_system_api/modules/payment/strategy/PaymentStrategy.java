package com.emmkay.infertility_system_api.modules.payment.strategy;

import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;


public interface PaymentStrategy {

    String createPayment(Object request, TreatmentRecord treatmentRecord);

    boolean handleIpn(Object object);

    String getPaymentMethod();

    String reloadPayment(Object request, TreatmentRecord treatmentRecord);
}
