package com.example.ai_insight_service.service;

import com.example.ai_insight_service.dto.InsightResultDto;
import com.example.ai_insight_service.dto.TaskEventDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskAnalysisService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;

    private final String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";
    private final RestTemplate restTemplate = new RestTemplate();

    public void analyzeTaskWithGemini(TaskEventDto task) {
        String url = apiUrl + apiKey;

        String prompt = "You are a smart personal assistant. Analyze this task.\n" +
                "Task Title: " + task.getTitle() + "\n" +
                "Description: " + task.getDescription() + "\n\n" +
                "1. Invent a single-word category that best describes this task's domain (e.g. WORK, SHOPPING, CHORES, FINANCE, IT, STUDY).\n"
                +
                "2. Determine the priority (LOW, MEDIUM, or HIGH).\n" +
                "3. Generate up to 5 relevant tags for this task based on context (e.g. BUG, FRONTEND, URGENT, DATABASE).\n"
                +
                "Reply ONLY with a valid JSON using exactly this format:\n" +
                "{ \"category\": \"<your_word>\", \"priority\": \"LOW/MEDIUM/HIGH\", \"tags\": [\"<tag1>\", \"<tag2>\"] }";

        try {
            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> contentPart = Map.of("parts", List.of(textPart));
            Map<String, Object> requestBodyMap = Map.of("contents", List.of(contentPart));

            String requestBodyJson = objectMapper.writeValueAsString(requestBodyMap);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBodyJson, headers);

            log.info("🚀 Sending task to Gemini for dynamic categorization and priority...");
            String response = restTemplate.postForObject(url, request, String.class);
            log.info("🤖 Raw Gemini replied: {}", response);

            JsonNode rootNode = objectMapper.readTree(response);
            String aiText = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text")
                    .asText();

            aiText = aiText.replace("```json", "").replace("```", "").trim();

            InsightResultDto resultDto = objectMapper.readValue(aiText, InsightResultDto.class);
            resultDto.setTaskId(task.getTaskId());

            String resultJson = objectMapper.writeValueAsString(resultDto);
            kafkaTemplate.send("task-insights", resultJson);

            log.info("📢 BOOM! Published AI insight back to Kafka under 'task-insights' successfully!");

        } catch (Exception e) {
            log.error("Failed to analyze task with Gemini API", e);
        }
    }
}
