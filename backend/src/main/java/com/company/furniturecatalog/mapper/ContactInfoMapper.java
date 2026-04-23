package com.company.furniturecatalog.mapper;

import com.company.furniturecatalog.domain.ContactInfo;
import com.company.furniturecatalog.dto.admin.request.CreateContactInfoRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateContactInfoRequest;
import com.company.furniturecatalog.dto.admin.response.ContactInfoAdminDto;
import com.company.furniturecatalog.dto.publicapi.ContactInfoPublicDto;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.ArrayList;
import java.util.List;

@Mapper(config = CatalogMapperConfig.class)
public interface ContactInfoMapper {

    ContactInfo toEntity(CreateContactInfoRequest request);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "label",          source = "label")
    @Mapping(target = "locale",         source = "locale")
    @Mapping(target = "phone",          source = "phone")
    @Mapping(target = "email",          source = "email")
    @Mapping(target = "whatsappNumber", source = "whatsappNumber")
    @Mapping(target = "addressLine1",   source = "addressLine1")
    @Mapping(target = "addressLine2",   source = "addressLine2")
    @Mapping(target = "city",           source = "city")
    @Mapping(target = "country",        source = "country")
    @Mapping(target = "postalCode",     source = "postalCode")
    @Mapping(target = "mapUrl",         source = "mapUrl")
    @Mapping(target = "workingHours",   source = "workingHours")
    @Mapping(target = "primary",        source = "primary")
    void updateEntity(UpdateContactInfoRequest request, @MappingTarget ContactInfo entity);

    @Mapping(target = "addressLines", expression = "java(addressLinesOf(contact))")
    ContactInfoPublicDto toPublicDto(ContactInfo contact);

    ContactInfoAdminDto toAdminDto(ContactInfo contact);

    default List<String> addressLinesOf(ContactInfo c) {
        if (c == null) return List.of();
        List<String> lines = new ArrayList<>(2);
        if (c.getAddressLine1() != null && !c.getAddressLine1().isBlank()) lines.add(c.getAddressLine1());
        if (c.getAddressLine2() != null && !c.getAddressLine2().isBlank()) lines.add(c.getAddressLine2());
        return lines;
    }
}
