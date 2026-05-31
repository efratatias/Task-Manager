package com.example.task_service.service;

import com.example.task_service.dto.TaskRequestDto;
import com.example.task_service.dto.TaskResponseDto;
import com.example.task_service.events.TaskEventProducer;
import com.example.task_service.exception.TaskNotFoundException;
import com.example.task_service.mapper.TaskMapper;
import com.example.task_service.model.Task;
import com.example.task_service.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskEventProducer taskEventProducer;
    private final TaskMapper taskMapper;

    public List<TaskResponseDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(taskMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskResponseDto> searchTasks(String priority, String category, String tag) {
        return taskRepository.searchTasks(priority, category, tag).stream()
                .map(taskMapper::toDto)
                .collect(Collectors.toList());
    }

    public TaskResponseDto getTaskById(Long id) {
        return taskRepository.findById(id)
                .map(taskMapper::toDto)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    @Transactional
    public TaskResponseDto createTask(TaskRequestDto taskRequest, String createdBy) {
        log.info("Creating task for user: {}", createdBy);

        Task task = taskMapper.toEntity(taskRequest);
        task.setCreatedBy(createdBy);

        if (task.getStatus() == null) {
            task.setStatus(Task.TaskStatus.NEW);
        }

        Task saved = taskRepository.save(task);
        taskEventProducer.sendEvent("TASK_CREATED", saved);

        log.info("Task created with id: {}", saved.getId());
        return taskMapper.toDto(saved);
    }

    @Transactional
    public TaskResponseDto updateTask(Long id, TaskRequestDto taskRequest) {
        log.info("Updating task with id: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));

        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        if (taskRequest.getStatus() != null) {
            task.setStatus(taskRequest.getStatus());
        }

        if (taskRequest.getCategory() != null) {
            task.setCategory(taskRequest.getCategory());
        }

        if (taskRequest.getPriority() != null) {
            task.setPriority(taskRequest.getPriority());
        }

        if (taskRequest.getTags() != null) {
            task.setTags(taskRequest.getTags());
        }

        Task saved = taskRepository.save(task);
        taskEventProducer.sendEvent("TASK_UPDATED", saved);

        return taskMapper.toDto(saved);
    }

    @Transactional
    public void deleteTask(Long id) {
        log.info("Deleting task with id: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));

        taskRepository.delete(task);
        taskEventProducer.sendEvent("TASK_DELETED", task);
    }

    public void updateTaskInsight(Long id, String category, String priority, java.util.List<String> tags) {
        log.info("Applying AI tags to task ID: {} -> Category: {}, Priority: {}", id, category, priority);
        Task task = taskRepository.findById(id).orElse(null);
        if (task != null) {
            task.setCategory(category);
            task.setPriority(priority);
            if (tags != null) {
                task.setTags(tags);
            }
            taskRepository.save(task);
            log.info("✅ Task ID: {} synchronized with AI tags successfully!", id);
        } else {
            log.warn("Task ID: {} not found for AI tags update.", id);
        }
    }

}
