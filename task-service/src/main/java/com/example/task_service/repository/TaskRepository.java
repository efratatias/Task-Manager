package com.example.task_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.task_service.model.Task;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN t.tags tag WHERE " +
            "(:priority IS NULL OR t.priority = :priority) AND " +
            "(:category IS NULL OR t.category = :category) AND " +
            "(:tag IS NULL OR tag = :tag)")
    List<Task> searchTasks(@Param("priority") String priority,
            @Param("category") String category,
            @Param("tag") String tag);
}
