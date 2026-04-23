import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminHeroSlideApi }   from '@/api/admin/heroSlides';
import { adminHomeSectionApi } from '@/api/admin/homeSections';
import { adminContactInfoApi } from '@/api/admin/contactInfo';
import { adminSiteSettingApi } from '@/api/admin/siteSettings';
import type {
  CreateContactInfoRequest,
  CreateHeroSlideRequest,
  CreateHomeSectionRequest,
  ReorderRequest,
  UpdateContactInfoRequest,
  UpdateHeroSlideRequest,
  UpdateHomeSectionRequest,
  UpsertSiteSettingRequest,
  UUID,
} from '@/types/api';

/* =========================================================================
 * Hero slides
 * ========================================================================= */

const heroKeys = {
  all:  ['admin', 'hero-slides'] as const,
};

export function useAdminHeroSlides() {
  return useQuery({ queryKey: heroKeys.all, queryFn: adminHeroSlideApi.list });
}

export function useCreateHeroSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHeroSlideRequest) => adminHeroSlideApi.create(body),
    onSuccess: () => invalidatePublicHome(qc, heroKeys.all),
  });
}

export function useUpdateHeroSlide(id: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateHeroSlideRequest) => adminHeroSlideApi.update(id, body),
    onSuccess: () => invalidatePublicHome(qc, heroKeys.all),
  });
}

export function useDeleteHeroSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => adminHeroSlideApi.delete(id),
    onSuccess: () => invalidatePublicHome(qc, heroKeys.all),
  });
}

export function useReorderHeroSlides() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReorderRequest) => adminHeroSlideApi.reorder(body),
    onSuccess: () => invalidatePublicHome(qc, heroKeys.all),
  });
}

export function useUploadHeroSlideImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: UUID; file: File }) =>
      adminHeroSlideApi.uploadImage(id, file),
    onSuccess: () => invalidatePublicHome(qc, heroKeys.all),
  });
}

/* =========================================================================
 * Homepage sections
 * ========================================================================= */

const sectionKeys = {
  all: ['admin', 'home-sections'] as const,
};

export function useAdminHomeSections() {
  return useQuery({ queryKey: sectionKeys.all, queryFn: adminHomeSectionApi.list });
}

export function useCreateHomeSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHomeSectionRequest) => adminHomeSectionApi.create(body),
    onSuccess: () => invalidatePublicHome(qc, sectionKeys.all),
  });
}

export function useUpdateHomeSection(id: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateHomeSectionRequest) => adminHomeSectionApi.update(id, body),
    onSuccess: () => invalidatePublicHome(qc, sectionKeys.all),
  });
}

export function useDeleteHomeSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => adminHomeSectionApi.delete(id),
    onSuccess: () => invalidatePublicHome(qc, sectionKeys.all),
  });
}

export function useReorderHomeSections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReorderRequest) => adminHomeSectionApi.reorder(body),
    onSuccess: () => invalidatePublicHome(qc, sectionKeys.all),
  });
}

/* =========================================================================
 * Contact info
 * ========================================================================= */

const contactKeys = {
  all: ['admin', 'contact-info'] as const,
};

export function useAdminContactInfo() {
  return useQuery({ queryKey: contactKeys.all, queryFn: adminContactInfoApi.list });
}

export function useCreateContactInfo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateContactInfoRequest) => adminContactInfoApi.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: contactKeys.all });
      void qc.invalidateQueries({ queryKey: ['public', 'contact'] });
    },
  });
}

export function useUpdateContactInfo(id: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateContactInfoRequest) => adminContactInfoApi.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: contactKeys.all });
      void qc.invalidateQueries({ queryKey: ['public', 'contact'] });
    },
  });
}

export function useDeleteContactInfo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => adminContactInfoApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: contactKeys.all });
      void qc.invalidateQueries({ queryKey: ['public', 'contact'] });
    },
  });
}

/* =========================================================================
 * Site settings
 * ========================================================================= */

const settingKeys = {
  all: ['admin', 'settings'] as const,
};

export function useAdminSiteSettings() {
  return useQuery({ queryKey: settingKeys.all, queryFn: adminSiteSettingApi.list });
}

export function useUpsertSiteSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, body }: { key: string; body: UpsertSiteSettingRequest }) =>
      adminSiteSettingApi.upsert(key, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingKeys.all });
      void qc.invalidateQueries({ queryKey: ['public', 'settings'] });
    },
  });
}

export function useDeleteSiteSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => adminSiteSettingApi.delete(key),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingKeys.all });
      void qc.invalidateQueries({ queryKey: ['public', 'settings'] });
    },
  });
}

/* ------------------------------ helpers ------------------------------ */

function invalidatePublicHome(qc: ReturnType<typeof useQueryClient>, key: readonly unknown[]) {
  void qc.invalidateQueries({ queryKey: key });
  // Refresh public /public/home so the live site reflects the edit immediately.
  void qc.invalidateQueries({ queryKey: ['public', 'home'] });
}
