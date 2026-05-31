package com.example.task_service.events;

import com.example.task_service.model.Task.TaskStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskEventDto {

    private String eventType;
    private Long taskId;
    private String title;
    private String description;
    private String createdBy;
    private TaskStatus status;
}
