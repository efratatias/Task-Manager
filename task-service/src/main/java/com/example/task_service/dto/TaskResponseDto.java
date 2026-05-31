package com.example.task_service.dto;

import com.example.task_service.model.Task.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDto {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private String category;
    private String priority;
    private List<String> tags;
    private String createdBy;
    private LocalDateTime createdAt;
}
