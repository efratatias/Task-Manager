package com.example.task_service.controller;

import com.example.task_service.dto.TaskRequestDto;
import com.example.task_service.dto.TaskResponseDto;
import com.example.task_service.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public List<TaskResponseDto> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/{id}")
    public TaskResponseDto getTask(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    @GetMapping("/search")
    public List<TaskResponseDto> searchTasks(@RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag) {
        return taskService.searchTasks(priority, category, tag);
    }

    @PostMapping
    public TaskResponseDto createTask(@Valid @RequestBody TaskRequestDto taskRequest, @RequestParam String createdBy) {
        return taskService.createTask(taskRequest, createdBy);
    }

    @PutMapping("/{id}")
    public TaskResponseDto updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequestDto taskRequest) {
        return taskService.updateTask(id, taskRequest);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }
}
