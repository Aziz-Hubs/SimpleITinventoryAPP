/**
 * @file use-models.ts
 * @description Hook for managing model data states using TanStack Query.
 * @path /hooks/api/use-models.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getModels,
  createModel,
  updateModel,
  deleteModel,
} from "@/services/model-service";
import { Model, ModelFilters, ModelCreate, ModelUpdate } from "@/lib/types";
import { toast } from "sonner";

export const MODEL_KEYS = {
  all: ["models"] as const,
  lists: () => [...MODEL_KEYS.all, "list"] as const,
  list: (filters: ModelFilters) => [...MODEL_KEYS.lists(), { filters }] as const,
  details: () => [...MODEL_KEYS.all, "detail"] as const,
  detail: (id: number) => [...MODEL_KEYS.details(), id] as const,
};

export function useModels(filters: ModelFilters = {}) {
  return useQuery({
    queryKey: MODEL_KEYS.list(filters),
    queryFn: () => getModels(filters),
  });
}

export function useModelById(id: number) {
  return useQuery({
    queryKey: MODEL_KEYS.detail(id),
    queryFn: () => getModelById(id),
    enabled: !!id,
  });
}

export function useModelMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: ModelCreate) => createModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODEL_KEYS.lists() });
      toast.success("Model created successfully");
    },
    onError: (error) => {
      console.error("Failed to create model:", error);
      toast.error("Failed to create model");
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ModelUpdate }) =>
      updateModel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODEL_KEYS.lists() });
      toast.success("Model updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update model:", error);
      toast.error("Failed to update model");
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODEL_KEYS.lists() });
      toast.success("Model deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete model:", error);
      toast.error("Failed to delete model");
    },
  });

  return {
    create: create.mutateAsync,
    update: (id: number, data: ModelUpdate) => update.mutateAsync({ id, data }),
    remove: remove.mutateAsync,
  };
}
