package com.example.task_service.dto;

import com.example.task_service.model.Task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequestDto {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Size(max = 500, message = "Description can be at most 500 characters")
    private String description;

    private TaskStatus status;
    private String category;
    private String priority;
    private List<String> tags;
}
