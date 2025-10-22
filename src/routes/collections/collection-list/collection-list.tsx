import { SingleColumnPage } from "@components/layout/pages";

import { CollectionListTable } from "@routes/collections/collection-list/components/collection-list-table";

import { useExtension } from "@providers/extension-provider";

export const CollectionList = () => {
  const { getWidgets } = useExtension();

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("product_collection.list.after"),
        before: getWidgets("product_collection.list.before"),
      }}
    >
      <CollectionListTable />
    </SingleColumnPage>
  );
};
