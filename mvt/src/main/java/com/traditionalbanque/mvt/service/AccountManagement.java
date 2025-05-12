package com.traditionalbanque.mvt.service;

import com.traditionalbanque.mvt.dto.AccountDto;
import com.traditionalbanque.mvt.dto.AccountMapper;
import com.traditionalbanque.mvt.entity.Account;
import com.traditionalbanque.mvt.exception.InsufficientFundsException;
import com.traditionalbanque.mvt.repository.AccountRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AccountManagement implements AccountService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;

    @Autowired
    public AccountManagement(AccountRepository accountRepository, AccountMapper accountMapper) {
        this.accountRepository = accountRepository;
        this.accountMapper = accountMapper;
    }

    @Override
    public AccountDto createAccount() {
        Account newAccount = new Account();
        newAccount.setBalance(0.0);
        Account savedAccount = this.accountRepository.save(newAccount);
        return accountMapper.toDto(savedAccount);
    }

    @Override
    public AccountDto deposit(Long accountId, Double amount) {
        Account account = this.accountRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found"));
        account.setBalance(account.getBalance() + amount);
        Account updatedAccount = this.accountRepository.save(account);
        return accountMapper.toDto(updatedAccount);
    }

    @Override
    public AccountDto withdraw(Long accountId, Double amount) throws InsufficientFundsException {
        Account account = this.accountRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found"));
        if (account.getBalance() < amount) {
            throw new InsufficientFundsException("Insufficient funds");
        }
        account.setBalance(account.getBalance() - amount);
        Account updatedAccount = this.accountRepository.save(account);
        return this.accountMapper.toDto(updatedAccount);
    }

    @Override
    public void transfer(Long fromAccountId, Long toAccountId, Double amount) throws InsufficientFundsException {
        AccountDto fromAccount = withdraw(fromAccountId, amount);
        deposit(toAccountId, amount);
    }

    @Override
    public AccountDto getAccountDetails(Long accountId) {
        Account account = this.accountRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found"));
        return this.accountMapper.toDto(account);
    }
}
