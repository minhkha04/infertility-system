package com.emmkay.infertility_system_api.controller;


import com.emmkay.infertility_system_api.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.service.TreatmentRecordService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/treatment-records")
public class TreatmentRecordController {

    TreatmentRecordService treatmentRecordService;

//    @GetMapping("/findAdd")
//    public TreatmentRecordResponse
}
