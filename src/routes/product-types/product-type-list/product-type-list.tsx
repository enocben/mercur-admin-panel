import { SingleColumnPage } from "@components/layout/pages";

import { ProductTypeListTable } from "@routes/product-types/product-type-list/components/product-type-list-table";

import { useExtension } from "@providers/extension-provider";

export const ProductTypeList = () => {
  const { getWidgets } = useExtension();

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("product_type.list.after"),
        before: getWidgets("product_type.list.before"),
      }}
    >
      <ProductTypeListTable />
    </SingleColumnPage>
  );
};
