package com.example.notification_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskEventDto {
    private Long taskId;
    private String eventType;
    private String title;
    private String description;
    private String createdBy;
    private TaskStatus status;

    public enum TaskStatus {
        NEW,
        IN_PROGRESS,
        DONE,
        CANCELLED
    }
}
