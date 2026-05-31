package com.example.task_service.mapper;

import com.example.task_service.dto.TaskRequestDto;
import com.example.task_service.dto.TaskResponseDto;
import com.example.task_service.model.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public Task toEntity(TaskRequestDto dto) {
        return Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .category(dto.getCategory())
                .priority(dto.getPriority())
                .tags(dto.getTags())
                .build();
    }

    public TaskResponseDto toDto(Task task) {
        return TaskResponseDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .createdBy(task.getCreatedBy())
                .createdAt(task.getCreatedAt())
                .category(task.getCategory())
                .priority(task.getPriority())
                .tags(task.getTags())
                .build();
    }

}
