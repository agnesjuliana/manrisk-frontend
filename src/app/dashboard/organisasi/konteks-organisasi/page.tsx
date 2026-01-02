"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";
import ArrayItemDialog from "@/components/konteks/OrganizationArrayDialog";
import ScopeSection from "@/components/konteks/ScopeSection";
import StakeholdersSection from "@/components/konteks/StakeholdersSection";
import CiaSection from "@/components/konteks/CiaSection";
import RegulationsSection from "@/components/konteks/RegulationsSection";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import {
  contextsApi,
  externalStakeholdersApi,
  ciaApi,
  usersApi,
  regulationsApi,
} from "@/lib/api";
import {
  loadUsers,
  saveUsers,
  type User as StoreUser,
  type MainRole as StoreMainRole,
} from "@/lib/usersStore";

type ContextData = {
  scope: {
    technical_bounds: { id?: string; name: string; description: string }[];
    notes: string;
  };
  stakeholders: {
    internal: {
      id?: string;
      name: string;
      email?: string;
      role?: string;
      division?: string;
    }[];
    external: { id?: string; name: string; interest: string }[];
  };
  cia_objectives: {
    confidentiality: string;
    integrity: string;
    availability: string;
    service_priorities: {
      priority_id?: string;
      service: string;
      C: number;
      I: number;
      A: number;
    }[];
  };
  regulations: {
    selected: { id?: string; name: string }[];
    notes: string;
  };
};

const initialData: ContextData = {
  scope: {
    technical_bounds: [],
    notes: "",
  },
  stakeholders: {
    internal: [],
    external: [],
  },
  cia_objectives: {
    confidentiality:
      "[Belum diisi] Jelaskan bagaimana organisasi melindungi kerahasiaan data dan informasi dari akses tidak sah",
    integrity:
      "[Belum diisi] Jelaskan bagaimana organisasi memastikan integritas data dan sistem tidak berubah tanpa otorisasi",
    availability:
      "[Belum diisi] Jelaskan target ketersediaan layanan sistem informasi yang kritis bagi operasional organisasi",
    service_priorities: [],
  },
  regulations: {
    selected: [],
    notes: "Fokus awal pada perlindungan data pribadi dan kontrol akses.",
  },
};

export default function KonteksOrganisasiPage() {
  const { user, isLoading: authLoading } = useAuth();

  // Check if user is RISK_OWNER
  const isRiskOwner = user?.role === "RISK_OWNER";

  // profile state - initialized from user data
  const [profile, setProfile] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });

  // Load profile from user data on mount
  useEffect(() => {
    if (user?.organization) {
      setProfile({
        name: user.organization.name || "",
        address: user.organization.address || "",
        email: user.organization.email || "",
        phone: user.organization.noTelp || "",
      });
    }
  }, [user]);

  const [data, setData] = useState<ContextData>(initialData);
  const [isLoadingContexts, setIsLoadingContexts] = useState(false);
  const [isLoadingInternalStakeholders, setIsLoadingInternalStakeholders] =
    useState(false);
  const [isLoadingExternalStakeholders, setIsLoadingExternalStakeholders] =
    useState(false);
  const [isLoadingCia, setIsLoadingCia] = useState(false);
  const [ciaLoadError, setCiaLoadError] = useState(false);
  const [isLoadingRegulations, setIsLoadingRegulations] = useState(false);

  // Load contexts from API on mount
  useEffect(() => {
    const loadContexts = async () => {
      setIsLoadingContexts(true);
      try {
        const response = await contextsApi.getAll(1, 1000);
        if (response.status && response.data) {
          const contexts = response.data.data.map((ctx) => ({
            id: ctx.id,
            name: ctx.name,
            description: ctx.description,
          }));

          setData((prev) => ({
            ...prev,
            scope: {
              ...prev.scope,
              technical_bounds: contexts,
            },
          }));
        }
      } catch (error) {
        console.error("Error loading contexts:", error);
      } finally {
        setIsLoadingContexts(false);
      }
    };

    loadContexts();
  }, []);

  // Load internal stakeholders from API on mount
  useEffect(() => {
    const loadInternalStakeholders = async () => {
      setIsLoadingInternalStakeholders(true);
      try {
        const response = await usersApi.getAll(1, 10);
        if (response.status && response.data) {
          const internalData = response.data.data.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            division: user.departmentId || "",
          }));

          setData((prev) => ({
            ...prev,
            stakeholders: {
              ...prev.stakeholders,
              internal: internalData,
            },
          }));
        }
      } catch (error) {
        console.error("Error loading internal stakeholders:", error);
      } finally {
        setIsLoadingInternalStakeholders(false);
      }
    };

    loadInternalStakeholders();
  }, []);

  // Load external stakeholders from API on mount
  useEffect(() => {
    const loadExternalStakeholders = async () => {
      setIsLoadingExternalStakeholders(true);
      try {
        const response = await externalStakeholdersApi.getAll(1, 1000);
        if (response.status && response.data) {
          const externalData = response.data.data.map((ext) => ({
            id: ext.id,
            name: ext.name,
            interest: ext.interest,
          }));

          setData((prev) => ({
            ...prev,
            stakeholders: {
              ...prev.stakeholders,
              external: externalData,
            },
          }));
        }
      } catch (error) {
        console.error("Error loading external stakeholders:", error);
      } finally {
        setIsLoadingExternalStakeholders(false);
      }
    };

    loadExternalStakeholders();
  }, []);

  // Load CIA objectives from API on mount
  useEffect(() => {
    const loadCia = async () => {
      setIsLoadingCia(true);
      setCiaLoadError(false);
      try {
        const response = await ciaApi.getObjectives();
        if (response.status && response.data) {
          const ciaData = response.data.cia_objectives;
          setData((prev) => ({
            ...prev,
            cia_objectives: {
              confidentiality: ciaData.confidentiality,
              integrity: ciaData.integrity,
              availability: ciaData.availability,
              service_priorities: ciaData.service_priorities.map((p) => ({
                service: p.service,
                C: p.C,
                I: p.I,
                A: p.A,
                // Store priority_id for API calls
                ...(p.priority_id ? { priority_id: p.priority_id } : {}),
              })),
            },
          }));
        }
      } catch (error) {
        console.error("Error loading CIA objectives:", error);
        setCiaLoadError(true);
      } finally {
        setIsLoadingCia(false);
      }
    };

    loadCia();
  }, []);

  // Load regulations from API on mount
  useEffect(() => {
    const loadRegulations = async () => {
      setIsLoadingRegulations(true);
      try {
        const response = await regulationsApi.getAll(1, 100);
        if (response.status && response.data) {
          const regulationList = response.data.data.map((reg) => ({
            id: reg.id,
            name: reg.name,
          }));

          setData((prev) => ({
            ...prev,
            regulations: {
              ...prev.regulations,
              selected: regulationList,
            },
          }));
        }
      } catch (error) {
        console.error("Error loading regulations:", error);
      } finally {
        setIsLoadingRegulations(false);
      }
    };

    loadRegulations();
  }, []);
  // users store - kept for user editing dialog if needed
  const [users, setUsers] = useState<StoreUser[]>(() => {
    if (typeof window === "undefined") return [];
    return loadUsers();
  });

  // generic edit dialog
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");

  function closeEdit() {
    setEditingSection(null);
    setDraftText("");
  }

  function saveEdit() {
    if (!editingSection) return;
    switch (editingSection) {
      case "scope.description":
        setData((s) => ({
          ...s,
          scope: { ...s.scope, description: draftText },
        }));
        break;
      case "scope.notes":
        setData((s) => ({ ...s, scope: { ...s.scope, notes: draftText } }));
        break;
      case "regulations.notes":
        setData((s) => ({
          ...s,
          regulations: { ...s.regulations, notes: draftText },
        }));
        break;
      default:
        break;
    }
    closeEdit();
  }

  // array modal state
  const [arrayModal, setArrayModal] = useState<{
    open: boolean;
    path: string | null;
    mode: "add" | "edit";
    index?: number;
  }>({ open: false, path: null, mode: "add" });
  const [itemDraft, setItemDraft] = useState<any>(null);

  function openAddModal(path: string) {
    setArrayModal({ open: true, path, mode: "add" });
    if (path === "stakeholders.internal" || path === "stakeholders.external")
      setItemDraft({ name: "", unit: "", type: "", interest: "" });
    else if (path === "cia.service_priorities")
      setItemDraft({ context_id: "", service: "", C: 50, I: 50, A: 50 });
    else setItemDraft("");
  }

  function openEditRow(path: string, idx: number) {
    setArrayModal({ open: true, path, mode: "edit", index: idx });
    if (path === "scope.technical_bounds") {
      setItemDraft(data.scope.technical_bounds[idx]);
    } else if (path === "regulations.selected") {
      setItemDraft(data.regulations.selected[idx].name);
    } else if (path === "stakeholders.external") {
      setItemDraft({ ...data.stakeholders.external[idx] });
    } else if (path === "cia.service_priorities") {
      setItemDraft({ ...data.cia_objectives.service_priorities[idx] });
    } else if (path === "stakeholders.internal") {
      // internal stakeholder -> edit user
      const u = users[idx];
      if (u) openUserEdit(u);
      // close array modal since we use user dialog
      setArrayModal({ open: false, path: null, mode: "add" });
    }
  }

  function closeArrayModal() {
    setArrayModal({ open: false, path: null, mode: "add" });
    setItemDraft(null);
  }

  function saveArrayItemFromDialog(validatedDraft: any) {
    if (!arrayModal.path) return;
    const path = arrayModal.path;
    const mode = arrayModal.mode;
    const idx = arrayModal.index ?? -1;

    // ========== ADD MODE ==========
    if (mode === "add") {
      if (path === "scope.technical_bounds") {
        (async () => {
          try {
            const response = await contextsApi.create({
              name: validatedDraft.name,
              description: validatedDraft.description,
            });
            if (response.status) {
              setData((s) => ({
                ...s,
                scope: {
                  ...s.scope,
                  technical_bounds: [
                    ...s.scope.technical_bounds,
                    {
                      id: response.data.id,
                      name: response.data.name,
                      description: response.data.description,
                    },
                  ],
                },
              }));
              closeArrayModal();
            }
          } catch (error) {
            console.error("Error creating context:", error);
          }
        })();
      } else if (path === "stakeholders.external") {
        (async () => {
          try {
            const response = await externalStakeholdersApi.create({
              name: validatedDraft.name,
              interest: validatedDraft.interest,
            });
            if (response.status) {
              setData((s) => ({
                ...s,
                stakeholders: {
                  ...s.stakeholders,
                  external: [
                    ...s.stakeholders.external,
                    {
                      id: response.data.id,
                      name: response.data.name,
                      interest: response.data.interest,
                    },
                  ],
                },
              }));
              closeArrayModal();
            }
          } catch (error) {
            console.error("Error creating external stakeholder:", error);
          }
        })();
      } else if (path === "regulations.selected") {
        (async () => {
          try {
            const response = await regulationsApi.create({
              name: String(validatedDraft),
            });
            if (response.status) {
              setData((s) => ({
                ...s,
                regulations: {
                  ...s.regulations,
                  selected: [
                    ...s.regulations.selected,
                    { id: response.data.id, name: response.data.name },
                  ],
                },
              }));
              closeArrayModal();
            }
          } catch (error) {
            console.error("Error creating regulation:", error);
          }
        })();
      } else if (path === "stakeholders.internal") {
        setData((s) => ({
          ...s,
          stakeholders: {
            ...s.stakeholders,
            internal: [...s.stakeholders.internal, validatedDraft],
          },
        }));
        closeArrayModal();
      } else if (path === "cia.service_priorities") {
        (async () => {
          try {
            const response = await ciaApi.createPriority({
              context_id: validatedDraft.context_id,
              service_name: validatedDraft.service,
              c_score: validatedDraft.C,
              i_score: validatedDraft.I,
              a_score: validatedDraft.A,
            });
            if (response.status) {
              setData((s) => ({
                ...s,
                cia_objectives: {
                  ...s.cia_objectives,
                  service_priorities: [
                    ...s.cia_objectives.service_priorities,
                    {
                      priority_id: response.data.priority_id,
                      service: response.data.service,
                      C: response.data.C,
                      I: response.data.I,
                      A: response.data.A,
                    },
                  ],
                },
              }));
              closeArrayModal();
            }
          } catch (error) {
            console.error("Error creating service priority:", error);
          }
        })();
      }
    }
    // ========== EDIT MODE ==========
    else if (mode === "edit") {
      if (idx < 0) return;

      if (path === "scope.technical_bounds") {
        const contextId = data.scope.technical_bounds[idx]?.id;
        if (!contextId) return;
        (async () => {
          try {
            const response = await contextsApi.update(contextId, {
              name: validatedDraft.name,
              description: validatedDraft.description,
            });
            if (response.status) {
              setData((s) => ({
                ...s,
                scope: {
                  ...s.scope,
                  technical_bounds: s.scope.technical_bounds.map((v, i) =>
                    i === idx
                      ? {
                          id: response.data.id,
                          name: response.data.name,
                          description: response.data.description,
                        }
                      : v
                  ),
                },
              }));
              closeArrayModal();
            }
          } catch (error) {
            console.error("Error updating context:", error);
          }
        })();
      } else if (path === "stakeholders.external") {
        const externalId = data.stakeholders.external[idx]?.id;
        if (!externalId) return;
        (async () => {
          try {
            const response = await externalStakeholdersApi.update(externalId, {
              name: validatedDraft.name,
              interest: validatedDraft.interest,
            });
            if (response.status) {
              setData((s) => ({
                ...s,
                stakeholders: {
                  ...s.stakeholders,
                  external: s.stakeholders.external.map((v, i) =>
                    i === idx
                      ? {
                          id: response.data.id,
                          name: response.data.name,
                          interest: response.data.interest,
                        }
                      : v
                  ),
                },
              }));
              closeArrayModal();
            }
          } catch (error) {
            console.error("Error updating external stakeholder:", error);
          }
        })();
      } else if (path === "regulations.selected") {
        const regulation = data.regulations.selected[idx];
        if (!regulation || !regulation.id) return;
        (async () => {
          try {
            const response = await regulationsApi.update(regulation.id as string, {
              name: String(validatedDraft),
            });
            if (response.status) {
              setData((s) => ({
                ...s,
                regulations: {
                  ...s.regulations,
                  selected: s.regulations.selected.map((reg, i) =>
                    i === idx
                      ? { id: response.data.id, name: response.data.name }
                      : reg
                  ),
                },
              }));
              closeArrayModal();
            }
          } catch (error) {
            console.error("Error updating regulation:", error);
          }
        })();
      } else if (path === "stakeholders.internal") {
        setData((s) => ({
          ...s,
          stakeholders: {
            ...s.stakeholders,
            internal: s.stakeholders.internal.map((v, i) =>
              i === idx ? validatedDraft : v
            ),
          },
        }));
        closeArrayModal();
      } else if (path === "cia.service_priorities") {
        const priorityId =
          data.cia_objectives.service_priorities[idx]?.priority_id;
        if (!priorityId) return;
        (async () => {
          try {
            const response = await ciaApi.updatePriority(priorityId, {
              service_name: validatedDraft.service,
              c_score: validatedDraft.C,
              i_score: validatedDraft.I,
              a_score: validatedDraft.A,
            });
            if (response.status) {
              setData((s) => ({
                ...s,
                cia_objectives: {
                  ...s.cia_objectives,
                  service_priorities: s.cia_objectives.service_priorities.map(
                    (v, i) =>
                      i === idx
                        ? {
                            priority_id: response.data.priority_id,
                            service: response.data.service,
                            C: response.data.C,
                            I: response.data.I,
                            A: response.data.A,
                          }
                        : v
                  ),
                },
              }));
              closeArrayModal();
            }
          } catch (error) {
            console.error("Error updating service priority:", error);
          }
        })();
      }
    }
  }

  function removeArrayItem(path: string, idx: number) {
    if (path === "scope.technical_bounds") {
      const contextId = data.scope.technical_bounds[idx]?.id;
      if (!contextId) return;
      // Call API to delete context
      (async () => {
        try {
          const response = await contextsApi.delete(contextId);
          if (response.status) {
            setData((s) => ({
              ...s,
              scope: {
                ...s.scope,
                technical_bounds: s.scope.technical_bounds.filter(
                  (_, i) => i !== idx
                ),
              },
            }));
          }
        } catch (error) {
          console.error("Error deleting context:", error);
        }
      })();
    } else if (path === "stakeholders.external") {
      const externalId = data.stakeholders.external[idx]?.id;
      if (!externalId) return;
      // Call API to delete external stakeholder
      (async () => {
        try {
          const response = await externalStakeholdersApi.delete(externalId);
          if (response.status) {
            setData((s) => ({
              ...s,
              stakeholders: {
                ...s.stakeholders,
                external: s.stakeholders.external.filter((_, i) => i !== idx),
              },
            }));
          }
        } catch (error) {
          console.error("Error deleting external stakeholder:", error);
        }
      })();
    } else if (path === "stakeholders.internal")
      setData((s) => ({
        ...s,
        stakeholders: {
          ...s.stakeholders,
          internal: s.stakeholders.internal.filter((_, i) => i !== idx),
        },
      }));
    else if (path === "cia.service_priorities") {
      const priorityId =
        data.cia_objectives.service_priorities[idx]?.priority_id;
      if (!priorityId) return;
      // Call API to delete service priority
      (async () => {
        try {
          const response = await ciaApi.deletePriority(priorityId);
          if (response.status) {
            setData((s) => ({
              ...s,
              cia_objectives: {
                ...s.cia_objectives,
                service_priorities: s.cia_objectives.service_priorities.filter(
                  (_, i) => i !== idx
                ),
              },
            }));
          }
        } catch (error) {
          console.error("Error deleting service priority:", error);
        }
      })();
    } else if (path === "regulations.selected") {
      const regulationId = data.regulations.selected[idx]?.id;
      if (!regulationId) return;
      // Call API to delete regulation
      (async () => {
        try {
          const response = await regulationsApi.delete(regulationId);
          if (response.status) {
            setData((s) => ({
              ...s,
              regulations: {
                ...s.regulations,
                selected: s.regulations.selected.filter((_, i) => i !== idx),
              },
            }));
          }
        } catch (error) {
          console.error("Error deleting regulation:", error);
        }
      })();
    }
  }

  // CIA single modal
  const [ciaEditOpen, setCiaEditOpen] = useState(false);
  const [ciaDraft, setCiaDraft] = useState({
    confidentiality: data.cia_objectives.confidentiality,
    integrity: data.cia_objectives.integrity,
    availability: data.cia_objectives.availability,
  });
  function openCiaEdit() {
    setCiaDraft({
      confidentiality: data.cia_objectives.confidentiality,
      integrity: data.cia_objectives.integrity,
      availability: data.cia_objectives.availability,
    });
    setCiaEditOpen(true);
  }
  function closeCiaEdit() {
    setCiaEditOpen(false);
  }
  function saveCiaEdit() {
    // Call API to update CIA objectives
    (async () => {
      try {
        const response = await ciaApi.updateObjectives({
          confidentiality: ciaDraft.confidentiality,
          integrity: ciaDraft.integrity,
          availability: ciaDraft.availability,
        });
        if (response.status) {
          setData((s) => ({
            ...s,
            cia_objectives: {
              ...s.cia_objectives,
              confidentiality: ciaDraft.confidentiality,
              integrity: ciaDraft.integrity,
              availability: ciaDraft.availability,
            },
          }));
        }
      } catch (error) {
        console.error("Error updating CIA objectives:", error);
      }
    })();
    closeCiaEdit();
  }

  // user edit (internal stakeholders map to users)
  const [userEditOpen, setUserEditOpen] = useState(false);
  const [userForm, setUserForm] = useState<StoreUser | null>(null);
  function openUserEdit(u: StoreUser) {
    setUserForm(u);
    setUserEditOpen(true);
  }
  function closeUserEdit() {
    setUserEditOpen(false);
    setUserForm(null);
  }
  function saveUserEdit() {
    if (!userForm) return;
    const next = users.map((x) => (x.id === userForm.id ? userForm : x));
    setUsers(next);
    saveUsers(next);
    closeUserEdit();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 w-full min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Konteks Organisasi
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola konteks dan strategi keamanan informasi organisasi
          </p>
        </div>
      </div>

      {/* Profile Card Section */}
      <Card className="border border-sky-100 shadow-md bg-white">
        <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">
                {authLoading ? <Skeleton className="h-6 w-48" /> : profile.name}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Informasi dasar instansi yang terdaftar
              </CardDescription>
            </div>
            {!isRiskOwner && (
              <Dialog>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Perbarui Profil Instansi</DialogTitle>
                    <DialogDescription>
                      Ubah informasi instansi Anda di sini.
                    </DialogDescription>
                  </DialogHeader>
                  <ProfileForm
                    initialValues={profile}
                    onSubmitProfile={(values) => {
                      setProfile(values);
                    }}
                    submitLabel="Simpan Perubahan"
                    isEditMode={true}
                  />
                </DialogContent>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Edit Profil
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {authLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-gradient-to-br from-sky-50/30 to-white border border-sky-100 hover:border-sky-200 hover:shadow-md transition-all">
                <div className="text-xs font-semibold text-sky-700 uppercase tracking-wide">
                  Alamat
                </div>
                <div className="font-medium text-gray-900 mt-2">
                  {profile.address}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-sky-50/30 to-white border border-sky-100 hover:border-sky-200 hover:shadow-md transition-all">
                <div className="text-xs font-semibold text-sky-700 uppercase tracking-wide">
                  Email
                </div>
                <div className="font-medium text-gray-900 mt-2">
                  {profile.email}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-sky-50/30 to-white border border-sky-100 hover:border-sky-200 hover:shadow-md transition-all">
                <div className="text-xs font-semibold text-sky-700 uppercase tracking-wide">
                  Telepon
                </div>
                <div className="font-medium text-gray-900 mt-2">
                  {profile.phone}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ScopeSection
          technical_bounds={data.scope.technical_bounds}
          openAddModal={openAddModal}
          openEditRow={openEditRow}
          removeArrayItem={removeArrayItem}
          isReadOnly={isRiskOwner}
        />

        <StakeholdersSection
          users={data.stakeholders.internal}
          external={data.stakeholders.external}
          openAddModal={openAddModal}
          openEditRow={openEditRow}
          removeArrayItem={removeArrayItem}
          isReadOnly={isRiskOwner}
        />

        <CiaSection
          cia={data.cia_objectives}
          ciaLoadError={ciaLoadError}
          onEdit={openCiaEdit}
          openAddModal={openAddModal}
          openEditRow={openEditRow}
          removeArrayItem={removeArrayItem}
          isReadOnly={isRiskOwner}
        />

        <RegulationsSection
          selected={data.regulations.selected}
          openAddModal={openAddModal}
          openEditRow={openEditRow}
          removeArrayItem={removeArrayItem}
          isReadOnly={isRiskOwner}
        />
      </div>

      {/* CIA Edit Dialog */}
      {!isRiskOwner && (
        <Dialog
          open={ciaEditOpen}
          onOpenChange={(v) => (v ? null : closeCiaEdit())}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Objektif CIA</DialogTitle>
              <DialogDescription>
                Ubah Confidentiality, Integrity, dan Availability sekaligus.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">
                  Confidentiality
                </Label>
                <Textarea
                  value={ciaDraft.confidentiality}
                  onChange={(e) =>
                    setCiaDraft((d) => ({
                      ...d,
                      confidentiality: e.target.value,
                    }))
                  }
                  className="min-h-20"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Integrity</Label>
                <Textarea
                  value={ciaDraft.integrity}
                  onChange={(e) =>
                    setCiaDraft((d) => ({ ...d, integrity: e.target.value }))
                  }
                  className="min-h-20"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">
                  Availability
                </Label>
                <Textarea
                  value={ciaDraft.availability}
                  onChange={(e) =>
                    setCiaDraft((d) => ({ ...d, availability: e.target.value }))
                  }
                  className="min-h-20"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={closeCiaEdit}>
                Batal
              </Button>
              <Button onClick={saveCiaEdit}>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Generic edit dialog */}
      {!isRiskOwner && (
        <Dialog
          open={!!editingSection}
          onOpenChange={(v) => (v ? null : closeEdit())}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit {editingSection}</DialogTitle>
              <DialogDescription>
                Ubah detail untuk bagian ini lalu simpan.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-900">Isi</Label>
              <Textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                className="min-h-24"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={closeEdit}>
                Batal
              </Button>
              <Button onClick={saveEdit}>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* User edit dialog */}
      {!isRiskOwner && (
        <Dialog
          open={userEditOpen}
          onOpenChange={(v) => (v ? null : closeUserEdit())}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Pengguna</DialogTitle>
              <DialogDescription>
                Ubah data pengguna internal stakeholder
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Nama</Label>
                <Input
                  value={userForm?.name ?? ""}
                  onChange={(e) =>
                    setUserForm((p) => (p ? { ...p, name: e.target.value } : p))
                  }
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Email</Label>
                <Input
                  type="email"
                  value={userForm?.email ?? ""}
                  onChange={(e) =>
                    setUserForm((p) => (p ? { ...p, email: e.target.value } : p))
                  }
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Role</Label>
                <Input
                  value={userForm?.role ?? ""}
                  onChange={(e) =>
                    setUserForm((p) =>
                      p ? { ...p, role: e.target.value as StoreMainRole } : p
                    )
                  }
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Divisi</Label>
                <Input
                  value={userForm?.division ?? ""}
                  onChange={(e) =>
                    setUserForm((p) =>
                      p ? { ...p, division: e.target.value } : p
                    )
                  }
                  className="border-gray-300"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={closeUserEdit}>
                Batal
              </Button>
              <Button onClick={saveUserEdit}>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Array item dialog (extracted) */}
      {!isRiskOwner && (
        <ArrayItemDialog
          open={arrayModal.open}
          path={arrayModal.path}
          mode={arrayModal.mode}
          draft={itemDraft}
          onChangeDraft={(v) => setItemDraft(v)}
          onClose={closeArrayModal}
          onSave={(validatedDraft) => saveArrayItemFromDialog(validatedDraft)}
          contexts={data.scope.technical_bounds.map((ctx) => ({
            id: ctx.id || "",
            name: ctx.name,
          }))}
        />
      )}
    </div>
  );
}
