package com.company.furniturecatalog.security;

import com.company.furniturecatalog.domain.AdminUser;
import com.company.furniturecatalog.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {

    private final AdminUserRepository repository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) {
        AdminUser user = repository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new UsernameNotFoundException("Unknown admin: " + email));
        return new AdminUserDetails(user);
    }

    /** Used by the JWT filter after we've resolved the user id from claims. */
    @Transactional(readOnly = true)
    public AdminUserDetails loadById(UUID id) {
        AdminUser user = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new UsernameNotFoundException("Unknown admin id: " + id));
        return new AdminUserDetails(user);
    }
}
