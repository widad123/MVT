package com.traditionalbanque.mvt.controller;

import com.traditionalbanque.mvt.dto.AccountDto;
import com.traditionalbanque.mvt.exception.InsufficientFundsException;
import com.traditionalbanque.mvt.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/accounts")
@CrossOrigin (origins = {"http://localhost:8081", "http://localhost:8080"}, allowCredentials = "true")
public class AccountController {
    private final AccountService accountService;

    @Autowired
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public AccountDto createAccount() {
        return accountService.createAccount();
    }

    @PostMapping("/{accountId}/deposit")
    public AccountDto deposit(@PathVariable Long accountId, @RequestBody Double amount) {
        return accountService.deposit(accountId, amount);
    }

    @PostMapping("/{accountId}/withdraw")
    public AccountDto withdraw(@PathVariable Long accountId, @RequestBody Double amount) throws InsufficientFundsException {
        return accountService.withdraw(accountId, amount);
    }

    @GetMapping("/{accountId}")
    public AccountDto getAccountDetails(@PathVariable Long accountId) {
        return accountService.getAccountDetails(accountId);
    }

    @PostMapping("/transfer")
    public void transfer(@RequestParam Long fromAccountId, @RequestParam Long toAccountId, @RequestParam Double amount) throws InsufficientFundsException {
        accountService.transfer(fromAccountId, toAccountId, amount);
    }
}
