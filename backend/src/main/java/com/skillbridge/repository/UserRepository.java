package com.skillbridge.repository;

import com.skillbridge.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    Optional<User> findByEmailAndUserType(String email, User.UserType userType);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.userType = 'FREELANCER' " +
           "AND (:location IS NULL OR LOWER(u.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:minRate IS NULL OR u.hourlyRate >= :minRate) " +
           "AND (:maxRate IS NULL OR u.hourlyRate <= :maxRate) " +
           "AND (:availability IS NULL OR u.availability = :availability)")
    Page<User> findFreelancers(@Param("location") String location,
                              @Param("minRate") Double minRate,
                              @Param("maxRate") Double maxRate,
                              @Param("availability") String availability,
                              Pageable pageable);
    
    @Query("SELECT u FROM User u JOIN u.skills s WHERE u.userType = 'FREELANCER' " +
           "AND LOWER(s) IN :skills")
    Page<User> findFreelancersBySkills(@Param("skills") java.util.List<String> skills, Pageable pageable);
}