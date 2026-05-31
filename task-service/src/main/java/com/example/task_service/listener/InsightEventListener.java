package com.example.task_service.listener;

import com.example.task_service.dto.InsightResultDto;
import com.example.task_service.service.TaskService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InsightEventListener {

    private final ObjectMapper objectMapper;
    private final TaskService taskService;

    @KafkaListener(topics = "task-insights", groupId = "task-service-group")
    public void consumeInsightEvent(String message) {
        try {
            InsightResultDto insight = objectMapper.readValue(message, InsightResultDto.class);
            log.info("🧠 Task-Service received AI Insight: Category='{}', Priority='{}', Tags={}",
                    insight.getCategory(), insight.getPriority(), insight.getTags());

            taskService.updateTaskInsight(insight.getTaskId(), insight.getCategory(), insight.getPriority(),
                    insight.getTags());

        } catch (Exception e) {
            log.error("Failed to process AI insight message", e);
        }
    }
}
