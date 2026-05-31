package com.example.ai_insight_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsightResultDto {
    private Long taskId;
    private String category;
    private String priority;
    private List<String> tags;
}
