package com.skillbridge.repository;

import com.skillbridge.model.Proposal;
import com.skillbridge.model.Project;
import com.skillbridge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    List<Proposal> findByProjectOrderByCreatedAtDesc(Project project);
    
    List<Proposal> findByFreelancerOrderByCreatedAtDesc(User freelancer);
    
    Optional<Proposal> findByProjectAndFreelancer(Project project, User freelancer);
    
    boolean existsByProjectAndFreelancer(Project project, User freelancer);
    
    long countByFreelancerAndStatus(User freelancer, Proposal.ProposalStatus status);
    
    @Query("SELECT COUNT(p) FROM Proposal p WHERE p.project.client = :client")
    long countByClient(@Param("client") User client);
    
    @Query("SELECT COUNT(p) FROM Proposal p WHERE p.project.client = :client AND p.status = :status")
    long countByClientAndStatus(@Param("client") User client, @Param("status") Proposal.ProposalStatus status);
    
    List<Proposal> findByProjectAndStatusNot(Project project, Proposal.ProposalStatus status);
}