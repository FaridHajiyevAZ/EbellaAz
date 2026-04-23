package com.company.furniturecatalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Structured contact block shown on the public site (phone, email, address,
 * WhatsApp number, working hours, social profiles as JSON).
 *
 * Modelled as a regular entity with {@link BaseEntity}'s audit fields rather
 * than {@link SoftDeletableEntity} — there is typically a small number of
 * published rows (one per locale/branch) and delete is a hard delete.
 */
@Entity
@Table(name = "contact_info")
@Getter
@Setter
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class ContactInfo extends BaseEntity {

    @ToString.Include
    @Column(name = "label", nullable = false, length = 120)
    private String label;

    @Column(name = "locale", nullable = false, length = 10)
    private String locale = "en";

    @Column(name = "phone", length = 40)
    private String phone;

    @Column(name = "email", length = 160)
    private String email;

    @Column(name = "whatsapp_number", length = 40)
    private String whatsappNumber;

    @Column(name = "address_line1", length = 200)
    private String addressLine1;

    @Column(name = "address_line2", length = 200)
    private String addressLine2;

    @Column(name = "city", length = 120)
    private String city;

    @Column(name = "country", length = 120)
    private String country;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "map_url", length = 500)
    private String mapUrl;

    /** e.g. {"mon_fri":"10:00-19:00","sat":"10:00-18:00","sun":"closed"}. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "working_hours", columnDefinition = "jsonb")
    private Map<String, String> workingHours = new LinkedHashMap<>();

    @Column(name = "is_primary", nullable = false)
    private boolean primary = true;
}
