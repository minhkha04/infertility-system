package com.emmkay.infertility_system_api.modules.payment.strategy;

import com.emmkay.infertility_system_api.modules.payment.configuration.VnPayConfig;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentEligibilityService;
import com.emmkay.infertility_system_api.modules.payment.service.PaymentTransactionService;
import com.emmkay.infertility_system_api.modules.payment.util.PaymentUtil;
import com.emmkay.infertility_system_api.modules.payment.util.VnPaySignatureUtil;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VnPaymentStrategy implements PaymentStrategy {

    VnPayConfig vnPayConfig;
    VnPaySignatureUtil vnPaySignatureUtil;
    PaymentUtil paymentUtil;
    PaymentEligibilityService paymentEligibilityService;

    @Override
    public String createPayment(Object request, Long recordId) throws UnsupportedEncodingException {
        HttpServletRequest req;
        try {
            req = (HttpServletRequest) request;
        } catch (Exception e) {
            log.error("Error when create payment url: {}", e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
        TreatmentRecord treatmentRecord = paymentEligibilityService.isAvailable(recordId, false);

        BigDecimal price = treatmentRecord.getService().getPrice().multiply(BigDecimal.valueOf(100));
        String amount = price.toBigInteger().toString();
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        String vnp_TxnRef = paymentUtil.getOrderId(recordId);
        String vnp_IpAddr = paymentUtil.getIpAddress(req);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String vnp_CreateDate = formatter.format(cld.getTime());
        String vnp_TmnCode = vnPayConfig.getTmnCode();
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());

        System.out.println("CreateDate: " + vnp_CreateDate);
        System.out.println("ExpireDate: " + vnp_ExpireDate);
        System.out.println("Local time: " + new Date());

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", amount);
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        System.out.println("Hash data " + hashData);
        String queryUrl = query.toString();
        String vnp_SecureHash = vnPaySignatureUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.getPaymentUrl() + "?" + queryUrl;
        return paymentUrl;
    }


    @Override
    public boolean handleIpn(Object object) {
        try {
            HttpServletRequest request = (HttpServletRequest) object;

            Map fields = new HashMap();
            for (Enumeration params = request.getParameterNames(); params.hasMoreElements();) {
                String fieldName = URLEncoder.encode((String) params.nextElement(), StandardCharsets.US_ASCII.toString());
                String fieldValue = URLEncoder.encode(request.getParameter(fieldName), StandardCharsets.US_ASCII.toString());
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    fields.put(fieldName, fieldValue);
                }
            }

            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            if (fields.containsKey("vnp_SecureHashType"))
            {
                fields.remove("vnp_SecureHashType");
            }
            if (fields.containsKey("vnp_SecureHash"))
            {
                fields.remove("vnp_SecureHash");
            }
            String signValue = vnPaySignatureUtil.hashAllFields(fields, vnPayConfig.getHashSecret());

            if (signValue.equalsIgnoreCase(vnp_SecureHash)) {
                long recordId = paymentUtil.extractRecordId(request.getParameter("vnp_TxnRef"));
                if (!"00".equals(request.getParameter("vnp_ResponseCode"))) {
                    log.warn("Payment failed with code {}", request.getParameter("vnp_ResponseCode") );
                    return false;
                }
//                treatmentRecordService.updatePaid(recordId);
            }
            return true; // RspCode = 00

        } catch (Exception e) {
            log.error("Exception in handleIpn (VNPAY IPN): ", e);
            return false; // RspCode = 99
        }
    }

    @Override
    public String getPaymentMethod() {
        return "VNPAY";
    }

    @Override
    public String reloadPayment(Object request, Long recordId) {
        return "";
    }
}
