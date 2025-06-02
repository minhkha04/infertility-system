package com.emmkay.infertility_system_api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
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
        validateImageFile(multipartFile);
        try {
            File pngFile = convertToPng(multipartFile);
            String publicId = prefix + "_" + slug;
            Map options = ObjectUtils.asMap(
                    "folder", "uploads",
                    "public_id", publicId,
                    "overwrite", true,
                    "resource_type", "image"
            );
            Map uploadResult = cloudinary.uploader().upload(pngFile, options);
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }
    public void validateImageFile(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();
        if (originalFilename == null || contentType == null) {
            throw new AppException(ErrorCode.INVALID_IMAGE_FILE);
        }
        if (!contentType.equalsIgnoreCase("image/jpeg") &&
                !contentType.equalsIgnoreCase("image/png")) {
            throw new AppException(ErrorCode.INVALID_IMAGE_FILE);
        }
        if (!originalFilename.toLowerCase().matches(".*\\.(jpg|jpeg|png)$")) {
            throw new AppException(ErrorCode.INVALID_IMAGE_FILE);
        }
    }
    public File convertToPng(MultipartFile file) throws IOException {
        BufferedImage originalImage = ImageIO.read(file.getInputStream());
        if (originalImage == null) {
            throw new AppException(ErrorCode.INVALID_IMAGE_FILE);
        }
        File pngFile = File.createTempFile("converted_", ".png");
        ImageIO.write(originalImage, "png", pngFile);
        return pngFile;
    }


}
