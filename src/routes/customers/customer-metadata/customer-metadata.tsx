import { useParams } from "react-router-dom";

import { MetadataForm } from "@components/forms/metadata-form";

import { useCustomer, useUpdateCustomer } from "@hooks/api";

export const CustomerMetadata = () => {
  const { id } = useParams();

  const { customer, isPending, isError, error } = useCustomer(id!);
  const { mutateAsync, isPending: isMutating } = useUpdateCustomer(id!);

  if (isError) {
    throw error;
  }

  return (
    <MetadataForm
      metadata={customer?.metadata}
      // @ts-expect-error @todo fix this
      hook={mutateAsync}
      isPending={isPending}
      isMutating={isMutating}
    />
  );
};
