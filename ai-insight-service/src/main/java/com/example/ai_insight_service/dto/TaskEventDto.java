package com.example.ai_insight_service.dto;

import lombok.Data;

@Data
public class TaskEventDto {
    private Long taskId;
    private String eventType;
    private String title;
    private String description;
    private String createdBy;
    private String status;
}
