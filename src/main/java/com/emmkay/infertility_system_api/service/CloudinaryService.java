package com.emmkay.infertility_system_api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CloudinaryService {

    Cloudinary cloudinary;

    public CloudinaryService(
        @Value("${cloudinary.name}") String cloudinaryName,
        @Value("${cloudinary.apiKey}") String cloudinaryApiKey,
        @Value("${cloudinary.apiSecret}") String cloudinaryApiSecret
    ) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudinaryName,
                "api_key", cloudinaryApiKey,
                "api_secret", cloudinaryApiSecret
        ));
    }

    public String uploadImage(MultipartFile multipartFile, String prefix, String slug) {
        try {
            File tempFile = File.createTempFile("temp", multipartFile.getOriginalFilename());
            multipartFile.transferTo(tempFile);

            String publicId = prefix + "_" + slug;

            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", "uploads",
                    "public_id", publicId,
                    "overwrite", true
            );

            Map uploadResult = cloudinary.uploader().upload(tempFile, options);
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }
}
