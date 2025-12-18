import * as zod from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { HttpTypes } from "@medusajs/types"
import { Button, Input, toast } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Form } from "../../../../../components/common/form"
import { RouteDrawer, useRouteModal } from "../../../../../components/modals"
import { KeyboundForm } from "../../../../../components/utilities/keybound-form"
import { useComboboxData } from "../../../../../hooks/use-combobox-data"
import { Combobox } from "../../../../../components/inputs/combobox"
import { useRequestTransferOrder } from "../../../../../hooks/api"
import { sdk } from "../../../../../lib/client"
import { TransferHeader } from "./transfer-header"

type CreateOrderTransferFormProps = {
  order: HttpTypes.AdminOrder
}

const CreateOrderTransferSchema = zod.object({
  customer_id: zod.string().min(1),
  current_customer_details: zod.string().min(1),
})

export function CreateOrderTransferForm({
  order,
}: CreateOrderTransferFormProps) {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()

  const form = useForm<zod.infer<typeof CreateOrderTransferSchema>>({
    defaultValues: {
      customer_id: "",
      current_customer_details: order.customer?.first_name
        ? `${order.customer?.first_name} ${order.customer?.last_name} (${order.customer?.email}) `
        : order.customer?.email,
    },
    resolver: zodResolver(CreateOrderTransferSchema),
  })

  const customers = useComboboxData({
    queryKey: ["customers"],
    queryFn: (params) =>
      sdk.admin.customer.list({ ...params, has_account: true }),
    getOptions: (data) =>
      data.customers.map((item) => ({
        label: `${item.first_name || ""} ${item.last_name || ""} (${item.email})`,
        value: item.id,
      })),
  })

  const { mutateAsync, isPending } = useRequestTransferOrder(order.id)

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await mutateAsync({
        customer_id: data.customer_id,
      })
      toast.success(t("orders.transfer.requestSuccess", { email: order.email }))
      handleSuccess()
    } catch (error) {
      toast.error((error as Error).message)
    }
  })

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex size-full flex-col overflow-hidden"
        data-testid="order-transfer-ownership-form"
      >
        <RouteDrawer.Body className="flex-1 overflow-auto" data-testid="order-transfer-ownership-form-body">
          <div className="flex flex-col gap-y-8">
            <div className="flex justify-center" data-testid="order-transfer-ownership-form-header">
              <TransferHeader />
            </div>
            <Form.Field
              control={form.control}
              name="current_customer_details"
              render={({ field }) => {
                return (
                  <Form.Item data-testid="order-transfer-ownership-form-current-customer-item">
                    <Form.Label data-testid="order-transfer-ownership-form-current-customer-label">{t("orders.transfer.currentOwner")}</Form.Label>
                    <span className="txt-small text-ui-fg-muted" data-testid="order-transfer-ownership-form-current-customer-hint">
                      {t("orders.transfer.currentOwnerDescription")}
                    </span>

                    <Form.Control data-testid="order-transfer-ownership-form-current-customer-control">
                      <Input type="email" {...field} disabled data-testid="order-transfer-ownership-form-current-customer-input" />
                    </Form.Control>

                    <Form.ErrorMessage data-testid="order-transfer-ownership-form-current-customer-error" />
                  </Form.Item>
                )
              }}
            />

            <Form.Field
              control={form.control}
              name="customer_id"
              render={({ field }) => {
                return (
                  <Form.Item data-testid="order-transfer-ownership-form-new-customer-item">
                    <Form.Label data-testid="order-transfer-ownership-form-new-customer-label">{t("orders.transfer.newOwner")}</Form.Label>
                    <span className="txt-small text-ui-fg-muted" data-testid="order-transfer-ownership-form-new-customer-hint">
                      {t("orders.transfer.newOwnerDescription")}
                    </span>

                    <Form.Control data-testid="order-transfer-ownership-form-new-customer-control">
                      <Combobox
                        {...field}
                        options={customers.options}
                        searchValue={customers.searchValue}
                        onSearchValueChange={customers.onSearchValueChange}
                        fetchNextPage={customers.fetchNextPage}
                        className="bg-ui-bg-field-component hover:bg-ui-bg-field-component-hover"
                        placeholder={t("actions.select")}
                        data-testid="order-transfer-ownership-form-new-customer-combobox"
                      />
                    </Form.Control>

                    <Form.ErrorMessage data-testid="order-transfer-ownership-form-new-customer-error" />
                  </Form.Item>
                )
              }}
            />
          </div>
        </RouteDrawer.Body>

        <RouteDrawer.Footer data-testid="order-transfer-ownership-form-footer">
          <div className="flex items-center justify-end gap-x-2" data-testid="order-transfer-ownership-form-footer-actions">
            <RouteDrawer.Close asChild>
              <Button variant="secondary" size="small" data-testid="order-transfer-ownership-form-cancel-button">
                {t("actions.cancel")}
              </Button>
            </RouteDrawer.Close>

            <Button
              isLoading={isPending}
              type="submit"
              variant="primary"
              size="small"
              disabled={!!Object.keys(form.formState.errors || {}).length}
              data-testid="order-transfer-ownership-form-save-button"
            >
              {t("actions.save")}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  )
}
