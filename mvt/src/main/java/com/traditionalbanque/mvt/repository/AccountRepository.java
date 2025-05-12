package com.traditionalbanque.mvt.repository;

import com.traditionalbanque.mvt.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {}
