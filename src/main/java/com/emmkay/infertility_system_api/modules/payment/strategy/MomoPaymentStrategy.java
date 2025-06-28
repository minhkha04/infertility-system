package com.emmkay.infertility_system_api.modules.payment.strategy;

import com.emmkay.infertility_system_api.modules.payment.builder.MomoRequestBuilder;
import com.emmkay.infertility_system_api.modules.payment.client.MomoApi;
import com.emmkay.infertility_system_api.modules.payment.configuration.MomoConfig;
import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoConfirmRequest;
import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoCreateRequest;
import com.emmkay.infertility_system_api.modules.payment.dto.request.MomoIpnRequest;
import com.emmkay.infertility_system_api.modules.payment.dto.response.MomoConfirmResponse;
import com.emmkay.infertility_system_api.modules.payment.dto.response.MomoCreateResponse;
import com.emmkay.infertility_system_api.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system_api.modules.payment.enums.PaymentMethod;
import com.emmkay.infertility_system_api.modules.payment.enums.PaymentStatus;
import com.emmkay.infertility_system_api.modules.payment.helper.QrCodeHelper;
import com.emmkay.infertility_system_api.modules.payment.repository.PaymentTransactionRepository;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentEligibilityService;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentTransactionService;
import com.emmkay.infertility_system_api.modules.payment.util.MomoSignatureUtil;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MomoPaymentStrategy implements PaymentStrategy {

    MomoConfig momoConfig;
    MomoApi momoApi;
    PaymentTransactionRepository paymentTransactionRepository;
    PaymentTransactionService paymentTransactionService;
    MomoRequestBuilder momoRequestBuilder;
    MomoSignatureUtil momoSignatureUtil;

    private void processPayment(PaymentTransaction paymentTransaction, String requestType) {
        MomoConfirmRequest momoConfirmRequest = momoRequestBuilder.buildMomoConfirmRequest(paymentTransaction, requestType);
        MomoConfirmResponse response = momoApi.confirmMomoPayment(momoConfirmRequest);

        switch (requestType.toLowerCase()) {
            case "capture":
                log.info("Xác nhận thanh toán thành công với MoMo");
                if (response.getResultCode() == 0) {
                    log.info("Momo xác nhận capture: {}", response.getMessage());
                    paymentTransactionService.updateStatus(paymentTransaction, PaymentStatus.SUCCESS);
                } else {
                    log.error("Momo từ chối capture: {}", response.getMessage());
                    paymentTransactionService.updateStatus(paymentTransaction, PaymentStatus.FAILED);
                }
                break;
            case "cancel":
                log.info("Thực hiện huỷ thanh toán với MoMo");
                if (response.getResultCode() == 0) {
                    log.info("MoMo xác nhận huỷ");
                } else {
                    log.error("MoMo từ chối huỷ: {}", response.getMessage());
                }
                paymentTransactionService.updateStatus(paymentTransaction, PaymentStatus.FAILED);
                break;
            default:
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

    }

    @Retry(name = "momoApi", fallbackMethod = "fallbackCreateMomoQr")
    public MomoCreateResponse createMomoQrSafe(MomoCreateRequest request) {
        return momoApi.createMomoQr(request);
    }

    public MomoCreateResponse fallbackCreateMomoQr(MomoCreateRequest request, Throwable t) {
        log.error("Gọi MoMo thất bại sau khi retry: {}", t.getMessage());
        throw new AppException(ErrorCode.MOMO_TIMEOUT); // lỗi tùy chỉnh của bạn
    }

    @Override
    public String createPayment(Object request, TreatmentRecord treatmentRecord) {
        PaymentTransaction paymentTransaction = paymentTransactionService.createTransaction(treatmentRecord, PaymentMethod.MOMO, 5);
        MomoCreateRequest momoCreateRequest = momoRequestBuilder.buildMomoRequest(paymentTransaction, UUID.randomUUID().toString());
        MomoCreateResponse momoCreateResponse = createMomoQrSafe(momoCreateRequest);
        String url = momoCreateResponse.getQrCodeUrl();
        return QrCodeHelper.generateQrBase64(url);
    }

    @Override
    public boolean handleIpn(Object object) {
        try {
            // 1. Ép kiểu IPN
            MomoIpnRequest request = (MomoIpnRequest) object;

            // 2. Verify chữ ký
            String rawData = momoRequestBuilder.buildRawData(request);
            String expectedSignature = momoSignatureUtil.hmacSHA256(rawData, momoConfig.getSecretKey());

            if (!expectedSignature.equals(request.getSignature())) {
                log.warn("Signature không khớp. Reject IPN.");
                throw new AppException(ErrorCode.VERIFY_PAYMENT_FAIL);
            }

            // 3. Lấy giao dịch tương ứng
            String transactionCode = request.getOrderId();
            PaymentTransaction paymentTransaction = paymentTransactionRepository
                    .findByTransactionCode(transactionCode)
                    .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));

            // 4. Xử lý theo trạng thái
            PaymentStatus currentStatus = paymentTransaction.getStatus();

            switch (currentStatus) {
                case FAILED:
                    log.warn("IPN báo thất bại, huỷ giao dịch {}", transactionCode);
                    processPayment(paymentTransaction, "cancel");
                    return false;

                case PENDING:
                    log.info("IPN xác nhận giao dịch thành công {}", transactionCode);
                    processPayment(paymentTransaction, "capture");
                    return true;

                default:
                    log.warn("IPN trong trạng thái không hợp lệ: {}", currentStatus);
                    return false;
            }

        } catch (Exception e) {
            log.error("Xử lý IPN thất bại: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.MOMO;
    }

    @Override
    public String reloadPayment(Object request, TreatmentRecord treatmentRecord) {
        PaymentTransaction paymentTransaction = paymentTransactionService.reloadTransaction(treatmentRecord, PaymentMethod.MOMO, 5);
        MomoCreateRequest momoCreateRequest = momoRequestBuilder.buildMomoRequest(paymentTransaction, UUID.randomUUID().toString());
        MomoCreateResponse momoCreateResponse = createMomoQrSafe(momoCreateRequest);
        String url = momoCreateResponse.getQrCodeUrl();
        return QrCodeHelper.generateQrBase64(url);
    }

}