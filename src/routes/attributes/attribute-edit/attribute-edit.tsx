import { useEffect, useState } from "react";

import type { AdminProductCategory } from "@medusajs/types";
import { Button, FocusModal, ProgressTabs, toast } from "@medusajs/ui";

import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import type { z } from "zod";

import {
  attributeQueryKeys,
  useAttribute,
  useUpdateAttribute,
} from "@hooks/api/attributes.tsx";

import { sdk } from "@lib/client";

import { AttributeForm } from "@routes/attributes/attribute-edit/components/attribute-form.tsx";

import type { CreateAttributeFormSchema } from "./schema";

export const AttributeEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState<AdminProductCategory[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "type">("details");
  const [tabStatuses, setTabStatuses] = useState<{
    detailsStatus: "not-started" | "in-progress" | "completed";
    typeStatus: "not-started" | "in-progress" | "completed";
  }>({
    detailsStatus: "completed", // Edit mode starts with completed status
    typeStatus: "completed", // Edit mode starts with completed status
  });
  const queryClient = useQueryClient();

  const { attribute, isLoading } = useAttribute(
    id ?? "",
    {
      fields:
        "name,description,handle,ui_component,product_categories.name,possible_values.*,is_filterable,is_required",
    },
    { enabled: !!id },
  );

  const { mutateAsync } = useUpdateAttribute(id!);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await sdk.client.fetch<{
          product_categories: AdminProductCategory[];
        }>("/admin/product-categories", {
          method: "GET",
        });
        setCategories(response.product_categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSave = async (
    data: z.infer<typeof CreateAttributeFormSchema>,
  ) => {
    try {
      const { ...payload } = data;
      await mutateAsync(payload);

      queryClient.invalidateQueries({ queryKey: attributeQueryKeys.lists() });

      toast.success("Attribute updated!");
      navigate(-1);
    } catch (error) {
      toast.error((error as Error).message);
      console.error(error);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (isLoading) {
    return null;
  }

  if (!attribute) {
    return null;
  }

  return (
    <FocusModal
      open={true}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <FocusModal.Content>
        <ProgressTabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "details" | "type")}
          className="h-full w-full"
        >
          <FocusModal.Header className="flex h-fit w-full items-center justify-between py-0">
            <div className="h-full w-full border-l">
              <ProgressTabs.List className="flex w-full items-center justify-start">
                <ProgressTabs.Trigger
                  value="details"
                  status={tabStatuses.detailsStatus}
                >
                  Details
                </ProgressTabs.Trigger>
                <ProgressTabs.Trigger
                  value="type"
                  status={tabStatuses.typeStatus}
                >
                  Type
                </ProgressTabs.Trigger>
              </ProgressTabs.List>
            </div>
          </FocusModal.Header>
          <FocusModal.Body className="flex flex-col items-center py-16">
            <div>
              <AttributeForm
                initialData={attribute}
                //@ts-expect-error correct data type will be received here
                onSubmit={handleSave}
                onCancel={handleClose}
                categories={categories}
                activeTab={activeTab}
                onFormStateChange={setTabStatuses}
              />
            </div>
          </FocusModal.Body>
        </ProgressTabs>
        <FocusModal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="attribute-form">
            Save
          </Button>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  );
};
