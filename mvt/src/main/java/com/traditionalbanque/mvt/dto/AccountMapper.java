package com.traditionalbanque.mvt.dto;

import com.traditionalbanque.mvt.entity.Account;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AccountMapper {
    AccountDto toDto(Account account);
}
