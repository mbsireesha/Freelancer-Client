package com.skillbridge.repository;

import com.skillbridge.model.Project;
import com.skillbridge.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClientOrderByCreatedAtDesc(User client);
    
    Page<Project> findByStatusOrderByCreatedAtDesc(Project.ProjectStatus status, Pageable pageable);
    
    @Query("SELECT p FROM Project p WHERE p.status = :status " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:minBudget IS NULL OR p.budget >= :minBudget) " +
           "AND (:maxBudget IS NULL OR p.budget <= :maxBudget) " +
           "AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY p.createdAt DESC")
    Page<Project> findProjectsWithFilters(@Param("status") Project.ProjectStatus status,
                                         @Param("category") String category,
                                         @Param("minBudget") Integer minBudget,
                                         @Param("maxBudget") Integer maxBudget,
                                         @Param("search") String search,
                                         Pageable pageable);
    
    @Query("SELECT p FROM Project p JOIN p.skills s WHERE p.status = 'OPEN' " +
           "AND LOWER(s) IN :skills ORDER BY p.createdAt DESC")
    Page<Project> findBySkills(@Param("skills") List<String> skills, Pageable pageable);
    
    long countByClientAndStatus(User client, Project.ProjectStatus status);
}