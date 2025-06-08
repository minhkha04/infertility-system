package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.configuration.VnPayConfig;
import com.emmkay.infertility_system_api.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.dto.response.UserResponse;
import com.emmkay.infertility_system_api.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.TreatmentRecordMapper;
import com.emmkay.infertility_system_api.repository.TreatmentRecordRepository;
import com.emmkay.infertility_system_api.repository.TreatmentServiceRepository;
import com.emmkay.infertility_system_api.repository.UserRepository;
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
public class VnPayService {

    VnPayConfig vnPayConfig;
    TreatmentRecordRepository treatmentRecordRepository;
    TreatmentRecordMapper treatmentRecordMapper;

    public String urlVnPay(HttpServletRequest req, Long recordId) throws UnsupportedEncodingException {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));

        if (treatmentRecord.getStatus().equalsIgnoreCase("CANCELLED")) {
            throw new AppException(ErrorCode.CANNOT_PAY);
        }
        if (treatmentRecord.getIsPaid()) {
            throw new AppException(ErrorCode.HAS_BEEN_PAID);
        }

        BigDecimal price = treatmentRecord.getService().getPrice().multiply(BigDecimal.valueOf(100));
        String amount = price.toBigInteger().toString();
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        String vnp_TxnRef = vnPayConfig.getRandomNumber(8) + "TR" + treatmentRecord.getId();
        String vnp_IpAddr = VnPayConfig.getIpAddress(req);

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
        String queryUrl = query.toString();
        String vnp_SecureHash = VnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.getPaymentUrl() + "?" + queryUrl;
//        System.out.println(paymentUrl);
        return paymentUrl;
    }

    private void verifyVnPayReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
            String paramName = params.nextElement();
            String value = request.getParameter(paramName);
            if (paramName.startsWith("vnp_")) {
                fields.put(paramName, value);
            }
        }
        String receivedHash = fields.remove("vnp_SecureHash");
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();

        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = fields.get(fieldName);
            hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
            if (i != fieldNames.size() - 1) hashData.append('&');
        }
        String calculatedHash = VnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        if (!calculatedHash.equals(receivedHash)) {
            throw new AppException(ErrorCode.VERIFY_PAYMENT_FAIL);
        }
    }

    public TreatmentRecordResponse resultPaymentVnPay(HttpServletRequest request) {
        verifyVnPayReturn(request);

        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");

        String vnp_TxnRef = request.getParameter("vnp_TxnRef");
        if (vnp_ResponseCode.equals("00")) {
            vnp_TxnRef = vnp_TxnRef.replace("TR", " ");
            int idx = vnp_TxnRef.indexOf(' ');
            long recordId = Long.parseLong(vnp_TxnRef.substring(idx + 1));
            TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                    .orElseThrow(() ->new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
            treatmentRecord.setIsPaid(true);
            return treatmentRecordMapper.toTreatmentRecordResponse(treatmentRecordRepository.save(treatmentRecord));
        } else {
            throw new AppException(ErrorCode.PAYMENT_FAIL);
        }
    }


}
