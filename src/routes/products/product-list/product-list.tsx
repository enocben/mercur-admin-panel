import { SingleColumnPage } from "@components/layout/pages";

import { ProductListTable } from "@routes/products/product-list/components/product-list-table";

import { useExtension } from "@providers/extension-provider";

export const ProductList = () => {
  const { getWidgets } = useExtension();

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("product.list.after"),
        before: getWidgets("product.list.before"),
      }}
    >
      <ProductListTable />
    </SingleColumnPage>
  );
};
