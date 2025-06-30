package com.emmkay.infertility_system.modules.payment.builder;

import com.emmkay.infertility_system.modules.payment.configuration.VnPayConfig;
import com.emmkay.infertility_system.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system.modules.payment.util.PaymentUtil;
import com.emmkay.infertility_system.modules.payment.util.VnPaySignatureUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VnPayRedirectUrlBuilder {

    VnPayConfig vnPayConfig;
    PaymentUtil paymentUtil;
    VnPaySignatureUtil vnPaySignatureUtil;

    public String buildRedirectUrl(PaymentTransaction paymentTransaction, HttpServletRequest req) {
        try {
            BigDecimal price = paymentTransaction.getAmount().multiply(BigDecimal.valueOf(100));
            String amount = price.toBigInteger().toString();
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String orderType = "other";
            String vnp_TxnRef = paymentTransaction.getTransactionCode();
            String vnp_IpAddr = paymentUtil.getIpAddress(req);
            String vnp_TmnCode = vnPayConfig.getTmnCode();

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");

            ZonedDateTime now = ZonedDateTime.now(zoneId);
            ZonedDateTime expired = paymentTransaction.getExpiredAt().atZone(zoneId);

            String vnp_CreateDate = now.format(formatter);
            String vnp_ExpireDate = expired.format(formatter);

            System.out.println("CreateDate: " + vnp_CreateDate);
            System.out.println("ExpireDate: " + vnp_ExpireDate);
            System.out.println("Local time: " + now);



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
            log.info("Hash data {}", hashData);
            String queryUrl = query.toString();
            String vnp_SecureHash = vnPaySignatureUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            return vnPayConfig.getPaymentUrl() + "?" + queryUrl;
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }
}
