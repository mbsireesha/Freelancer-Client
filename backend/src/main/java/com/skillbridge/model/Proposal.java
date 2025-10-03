package com.skillbridge.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "proposals", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"project_id", "freelancer_id"})
})
@EntityListeners(AuditingEntityListener.class)
public class Proposal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference("project-proposals")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    @JsonBackReference("user-proposals")
    private User freelancer;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String coverLetter;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer proposedBudget;

    @NotBlank
    @Column(nullable = false)
    private String timeline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProposalStatus status = ProposalStatus.PENDING;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public Proposal() {}

    public Proposal(Project project, User freelancer, String coverLetter, 
                   Integer proposedBudget, String timeline) {
        this.project = project;
        this.freelancer = freelancer;
        this.coverLetter = coverLetter;
        this.proposedBudget = proposedBudget;
        this.timeline = timeline;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public User getFreelancer() { return freelancer; }
    public void setFreelancer(User freelancer) { this.freelancer = freelancer; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public Integer getProposedBudget() { return proposedBudget; }
    public void setProposedBudget(Integer proposedBudget) { this.proposedBudget = proposedBudget; }

    public String getTimeline() { return timeline; }
    public void setTimeline(String timeline) { this.timeline = timeline; }

    public ProposalStatus getStatus() { return status; }
    public void setStatus(ProposalStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum ProposalStatus {
        PENDING, ACCEPTED, REJECTED
    }
}