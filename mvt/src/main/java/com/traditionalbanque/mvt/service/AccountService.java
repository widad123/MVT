package com.traditionalbanque.mvt.service;

import com.traditionalbanque.mvt.dto.AccountDto;
import com.traditionalbanque.mvt.exception.InsufficientFundsException;

public interface AccountService {
    AccountDto createAccount();
    AccountDto deposit(Long accountId, Double amount);
    AccountDto withdraw(Long accountId, Double amount) throws InsufficientFundsException;
    void transfer(Long fromAccountId, Long toAccountId, Double amount) throws InsufficientFundsException;
    AccountDto getAccountDetails(Long accountId);
}
