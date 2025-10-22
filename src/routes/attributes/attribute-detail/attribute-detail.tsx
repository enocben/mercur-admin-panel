import { EllipsisHorizontal } from "@medusajs/icons";
import {
  Badge,
  Button,
  Container,
  DropdownMenu,
  Heading,
  Text,
  toast,
} from "@medusajs/ui";

import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { SectionRow } from "@components/common/section";
import { SingleColumnLayout } from "@components/layout/single-column";

import { attributeQueryKeys, useAttribute } from "@hooks/api/attributes.tsx";

import { sdk } from "@lib/client";

import { PossibleValuesTable } from "@routes/attributes/attribute-edit-possible-value/components/possible-values-table.tsx";

export const AttributeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { attribute, isLoading } = useAttribute(
    id ?? "",
    {
      fields:
        "name, description, handle, product_categories.name, possible_values.*,is_filterable,is_required,ui_component",
    },
    { enabled: !!id },
  );

  if (isLoading) {
    return (
      <Container>
        <div className="flex h-[200px] items-center justify-center">
          <Text>Loading...</Text>
        </div>
      </Container>
    );
  }

  if (!attribute) {
    return (
      <Container>
        <div className="flex h-[200px] items-center justify-center">
          <Text>Attribute not found</Text>
        </div>
      </Container>
    );
  }

  const handleEdit = () => {
    navigate(`/settings/attributes/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await sdk.client.fetch(`/admin/attributes/${id}`, {
        method: "DELETE",
      });
      toast.success("Attribute deleted!");
      queryClient.invalidateQueries({ queryKey: attributeQueryKeys.list() });
      navigate("/attributes");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <SingleColumnLayout>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">{attribute.name}</Heading>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button variant="transparent" size="small">
                  <EllipsisHorizontal />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Item onClick={handleEdit}>Edit</DropdownMenu.Item>
                <DropdownMenu.Item onClick={handleDelete}>
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </div>

        <SectionRow title="Description" value={attribute.description} />
        <SectionRow title="Handle" value={attribute.handle} />
        <SectionRow title="Type" value={attribute.ui_component} />
        <SectionRow
          title="Filterable"
          value={attribute.is_filterable ? "True" : "False"}
        />
        <SectionRow
          title="Required"
          value={attribute.is_required ? "True" : "False"}
        />
        <SectionRow
          title="Global"
          value={!attribute.product_categories?.length ? "True" : "False"}
        />

        {attribute.product_categories &&
          attribute.product_categories.length > 0 && (
            <SectionRow
              title="Product Categories"
              value={
                <>
                  {attribute.product_categories.map(
                    (category: { id: string; name: string }) => (
                      <Badge size="xsmall" key={category.id}>
                        {category.name}
                      </Badge>
                    ),
                  )}
                </>
              }
            />
          )}
      </Container>

      <PossibleValuesTable attribute={attribute} isLoading={isLoading} />
    </SingleColumnLayout>
  );
};
