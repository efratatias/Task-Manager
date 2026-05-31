package com.example.notification_service.listener;

import com.example.notification_service.dto.TaskEventDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TaskEventListener {

    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "task-events", groupId = "notification-group")
    public void listen(String message) {
        try {
            TaskEventDto dto = objectMapper.readValue(message, TaskEventDto.class);

            System.out.println(
                "📢 Notification: Task '" + dto.getTitle() +
                "' (" + dto.getEventType() + ") by " + dto.getCreatedBy()
            );

        } catch (Exception e) {
            System.out.println("❌ Error parsing json: " + e.getMessage());
        }
    }
}
