package com.example.task_service.events;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.example.task_service.model.Task;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class TaskEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendEvent(String eventType, Task task) {
        try {
            TaskEventDto dto = TaskEventDto.builder()
                    .eventType(eventType)
                    .taskId(task.getId())
                    .title(task.getTitle())
                    .description(task.getDescription())
                    .createdBy(task.getCreatedBy())
                    .status(task.getStatus())
                    .build();

            String json = objectMapper.writeValueAsString(dto);

            kafkaTemplate.send("task-events", json);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send Kafka event", e);
        }
    }
}
