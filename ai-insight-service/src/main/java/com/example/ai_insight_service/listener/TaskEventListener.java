package com.example.ai_insight_service.listener;

import com.example.ai_insight_service.dto.TaskEventDto;
import com.example.ai_insight_service.service.TaskAnalysisService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TaskEventListener {

    private final ObjectMapper objectMapper;

    private final TaskAnalysisService taskAnalysisService;

    @KafkaListener(topics = "task-events", groupId = "ai-insight-group")
    public void consumeTaskEvent(String message) {
        try {
            TaskEventDto event = objectMapper.readValue(message, TaskEventDto.class);

            log.info("🎯 AI Engine received a new task for analysis: {} (ID: {})", event.getTitle(), event.getTaskId());
            log.info("Description to analyze: {}", event.getDescription());

            taskAnalysisService.analyzeTaskWithGemini(event);

        } catch (Exception e) {
            log.error("Failed to parse task event from Kafka", e);
        }
    }
}
