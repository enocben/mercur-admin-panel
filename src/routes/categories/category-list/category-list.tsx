import { SingleColumnPage } from "@components/layout/pages";

import { CategoryListTable } from "@routes/categories/category-list/components/category-list-table";

import { useExtension } from "@providers/extension-provider";

export const CategoryList = () => {
  const { getWidgets } = useExtension();

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("product_category.list.after"),
        before: getWidgets("product_category.list.before"),
      }}
      hasOutlet
    >
      <CategoryListTable />
    </SingleColumnPage>
  );
};
