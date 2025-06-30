package com.emmkay.infertility_system_api.modules.email.helper;

import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TemplateRenderer {

    ResourceLoader resourceLoader;
    String BASE_TEMPLATE_PATH = "classpath:templates/email/";

    private String loadTemplate(String templateName) {
        try {
            log.info("Loading template: {}", BASE_TEMPLATE_PATH + templateName);
            Resource resource = resourceLoader.getResource(BASE_TEMPLATE_PATH + templateName);
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new AppException(ErrorCode.TEMPLATE_NOT_FOUND);
        }
    }

    public String render(String templateName, Map<String, String> values) {
        String content = loadTemplate(templateName);

        for (Map.Entry<String, String> entry : values.entrySet()) {
            content = content.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return content;
    }

}
