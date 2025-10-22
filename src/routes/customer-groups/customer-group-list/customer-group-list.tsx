import { SingleColumnPage } from "@components/layout/pages";

import { CustomerGroupListTable } from "@routes/customer-groups/customer-group-list/components/customer-group-list-table";

import { useExtension } from "@providers/extension-provider";

export const CustomerGroupsList = () => {
  const { getWidgets } = useExtension();

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("customer_group.list.after"),
        before: getWidgets("customer_group.list.before"),
      }}
    >
      <CustomerGroupListTable />
    </SingleColumnPage>
  );
};
