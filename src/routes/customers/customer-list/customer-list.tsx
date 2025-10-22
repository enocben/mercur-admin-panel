import { SingleColumnPage } from "@components/layout/pages";

import { CustomerListTable } from "@routes/customers/customer-list/components/customer-list-table";

import { useExtension } from "@providers/extension-provider";

export const CustomersList = () => {
  const { getWidgets } = useExtension();

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("customer.list.after"),
        before: getWidgets("customer.list.before"),
      }}
    >
      <CustomerListTable />
    </SingleColumnPage>
  );
};
