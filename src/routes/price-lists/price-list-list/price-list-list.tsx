import { SingleColumnPage } from "@components/layout/pages";

import { PriceListListTable } from "@routes/price-lists/price-list-list/components/price-list-list-table";

import { useExtension } from "@providers/extension-provider";

export const PriceListList = () => {
  const { getWidgets } = useExtension();

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("price_list.list.after"),
        before: getWidgets("price_list.list.before"),
      }}
    >
      <PriceListListTable />
    </SingleColumnPage>
  );
};
