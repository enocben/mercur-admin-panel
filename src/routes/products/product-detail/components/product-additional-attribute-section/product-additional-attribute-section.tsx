import { useEffect, useState } from "react";

import { InformationCircleSolid, PencilSquare } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
  Label,
  Table,
  Tooltip,
  toast,
} from "@medusajs/ui";

import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

import { ActionMenu } from "@components/common/action-menu";
import { RouteDrawer } from "@components/modals";

import { useProduct, useProductAttributes, useUpdateProduct } from "@hooks/api";

import { FormComponents } from "@routes/products/product-detail/components/product-additional-attribute-section/components/form-components.tsx";

export const ProductAdditionalAttributeSection = () => {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const { product, isLoading: isProductLoading } = useProduct(id!, {
    fields: "attribute_values.*,attribute_values.attribute.*",
  });

  const { data, isLoading } = useProductAttributes(id!);

  const attributes = data?.attributes || [];

  const { mutate: updateProduct } = useUpdateProduct(id!);

  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    defaultValues: {},
  });

  // Reset form when product data is loaded
  useEffect(() => {
    if (product?.attribute_values) {
      // @todo fix any type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      product.attribute_values.forEach((curr: any) => {
        form.setValue(curr.attribute_id, curr.value);
      });
    }
  }, [product?.attribute_values, form]);
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    const formattedData = Object.keys(data).map((key) => {
      const attribute = attributes.find(
        // @todo fix any type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any) => a.id === key && a.ui_component === "select",
      );
      const value = attribute?.possible_values?.find(
        // @todo fix any type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (pv: any) => pv.id === data[key],
      )?.value;

      return (
        value && {
          [key]: value,
        }
      );
    });
    const payload = {
      ...data,
      ...Object.assign({}, ...formattedData.filter(Boolean)),
    };

    const values = Object.keys(payload).reduce(
      (acc: Array<Record<string, string>>, key) => {
        acc.push({ attribute_id: key, value: payload[key] });

        return acc;
      },
      [],
    );

    updateProduct(
      {
        additional_data: { values },
      },
      {
        onSuccess: () => {
          toast.success("Product updated successfully");
          setOpen(false);
        },
      },
    );
  };

  if (isLoading || isProductLoading) return <div>Loading...</div>;

  return (
    <>
      <div>
        <Container className="divide-y p-0 pb-2">
          <div className="flex items-center justify-between px-6 py-4">
            <Heading level="h2">Additional Attributes</Heading>
            <ActionMenu
              groups={[
                {
                  actions: [
                    {
                      label: "Edit",
                      onClick: () => setOpen(true),
                      icon: <PencilSquare />,
                    },
                  ],
                },
              ]}
            />
          </div>

          <div className="mb-6">
            <Table>
              <Table.Body>
                {// @todo fix any type
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                product?.attribute_values?.map((attribute: any) => (
                  <Table.Row key={attribute?.id}>
                    <Table.Cell>{attribute?.attribute?.name}</Table.Cell>
                    <Table.Cell>{attribute?.value}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Container>
      </div>
      {open && (
        <RouteDrawer>
          <RouteDrawer.Header>
            <Heading level="h2">Additional Attributes</Heading>
          </RouteDrawer.Header>
          <RouteDrawer.Body className="m-4 max-h-[calc(86vh)] overflow-y-auto py-2">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-0">
                {
                  // @todo fix any type
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  attributes.map((a: any) => (
                    <div
                      key={`form-field-${a.handle}-${a.id}`}
                      className="-mx-4 mb-4"
                    >
                      <Label className="mb-2 flex items-center gap-x-2">
                        {a.name}
                        {a.description && (
                          <Tooltip content={a.description}>
                            <InformationCircleSolid />
                          </Tooltip>
                        )}
                      </Label>
                      <FormComponents
                        attribute={a}
                        field={{
                          name: a.id,
                          value: form.watch(a.id),
                          defaultValue: form.getValues(a.id),
                          // @todo fix any type
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onChange: (e: any) => {
                            form.setValue(a.id, e.target.value);
                          },
                        }}
                      />
                    </div>
                  ))
                }
                <div className="-mx-4 mt-4 flex justify-end">
                  <Button>Save</Button>
                </div>
              </form>
            </FormProvider>
          </RouteDrawer.Body>
        </RouteDrawer>
      )}
    </>
  );
};
