import { Buildings, XCircle } from "@medusajs/icons"
import {
  AdminOrder,
  AdminOrderFulfillment,
  AdminOrderLineItem,
  HttpTypes,
  OrderLineItemDTO,
} from "@medusajs/types"
import {
  Button,
  Container,
  Copy,
  Heading,
  StatusBadge,
  Text,
  Tooltip,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { Skeleton } from "../../../../../components/common/skeleton"
import { Thumbnail } from "../../../../../components/common/thumbnail"
import {
  useCancelOrderFulfillment,
  useMarkOrderFulfillmentAsDelivered,
} from "../../../../../hooks/api/orders"
import { useStockLocation } from "../../../../../hooks/api/stock-locations"
import { formatProvider } from "../../../../../lib/format-provider"
import { getLocaleAmount } from "../../../../../lib/money-amount-helpers"
import { FulfillmentSetType } from "../../../../locations/common/constants"

type OrderFulfillmentSectionProps = {
  order: AdminOrder
}

export const OrderFulfillmentSection = ({
  order,
}: OrderFulfillmentSectionProps) => {
  const fulfillments = order.fulfillments || []

  return (
    <div className="flex flex-col gap-y-3" data-testid="order-fulfillment-section">
      <UnfulfilledItemBreakdown order={order} />
      {fulfillments.map((f, index) => (
        <Fulfillment key={f.id} index={index} fulfillment={f} order={order} />
      ))}
    </div>
  )
}

const UnfulfilledItem = ({
  item,
  currencyCode,
}: {
  item: OrderLineItemDTO & { variant: HttpTypes.AdminProductVariant }
  currencyCode: string
}) => {
  return (
    <div
      key={item.id}
      className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4"
      data-testid={`order-unfulfilled-item-${item.id}`}
    >
      <div className="flex items-start gap-x-4" data-testid={`order-unfulfilled-item-${item.id}-info`}>
        <Thumbnail src={item.thumbnail} data-testid={`order-unfulfilled-item-${item.id}-thumbnail`} />
        <div>
          <Text
            size="small"
            leading="compact"
            weight="plus"
            className="text-ui-fg-base"
            data-testid={`order-unfulfilled-item-${item.id}-title`}
          >
            {item.title}
          </Text>
          {item.variant_sku && (
            <div className="flex items-center gap-x-1" data-testid={`order-unfulfilled-item-${item.id}-sku`}>
              <Text size="small" data-testid={`order-unfulfilled-item-${item.id}-sku-value`}>{item.variant_sku}</Text>
              <Copy content={item.variant_sku} className="text-ui-fg-muted" data-testid={`order-unfulfilled-item-${item.id}-sku-copy`} />
            </div>
          )}
          <Text size="small" data-testid={`order-unfulfilled-item-${item.id}-variant-options`}>
            {item.variant?.options?.map((o) => o.value).join(" · ")}
          </Text>
        </div>
      </div>
      <div className="grid grid-cols-3 items-center gap-x-4" data-testid={`order-unfulfilled-item-${item.id}-pricing`}>
        <div className="flex items-center justify-end" data-testid={`order-unfulfilled-item-${item.id}-unit-price`}>
          <Text size="small" data-testid={`order-unfulfilled-item-${item.id}-unit-price-value`}>
            {getLocaleAmount(item.unit_price, currencyCode)}
          </Text>
        </div>
        <div className="flex items-center justify-end" data-testid={`order-unfulfilled-item-${item.id}-quantity`}>
          <Text data-testid={`order-unfulfilled-item-${item.id}-quantity-value`}>
            <span className="tabular-nums">
              {item.quantity - item.detail.fulfilled_quantity}
            </span>
            x
          </Text>
        </div>
        <div className="flex items-center justify-end" data-testid={`order-unfulfilled-item-${item.id}-subtotal`}>
          <Text size="small" data-testid={`order-unfulfilled-item-${item.id}-subtotal-value`}>
            {getLocaleAmount(item.subtotal || 0, currencyCode)}
          </Text>
        </div>
      </div>
    </div>
  )
}

const UnfulfilledItemBreakdown = ({ order }: { order: AdminOrder }) => {
  // Create an array of order items that haven't been fulfilled or at least not fully fulfilled
  const unfulfilledItemsWithShipping = order.items!.filter(
    (i) => i.requires_shipping && i.detail.fulfilled_quantity < i.quantity
  )

  const unfulfilledItemsWithoutShipping = order.items!.filter(
    (i) => !i.requires_shipping && i.detail.fulfilled_quantity < i.quantity
  )

  return (
    <>
      {!!unfulfilledItemsWithShipping.length && (
        <UnfulfilledItemDisplay
          order={order}
          unfulfilledItems={unfulfilledItemsWithShipping}
          requiresShipping={true}
        />
      )}

      {!!unfulfilledItemsWithoutShipping.length && (
        <UnfulfilledItemDisplay
          order={order}
          unfulfilledItems={unfulfilledItemsWithoutShipping}
          requiresShipping={false}
        />
      )}
    </>
  )
}

const UnfulfilledItemDisplay = ({
  order,
  unfulfilledItems,
  requiresShipping = false,
}: {
  order: AdminOrder
  unfulfilledItems: AdminOrderLineItem[]
  requiresShipping: boolean
}) => {
  const { t } = useTranslation()

  if (order.status === "canceled") {
    return
  }

  return (
    <Container className="divide-y p-0" data-testid="order-unfulfilled-items-section">
      <div className="flex items-center justify-between px-6 py-4" data-testid="order-unfulfilled-items-header">
        <Heading level="h2" data-testid="order-unfulfilled-items-heading">{t("orders.fulfillment.unfulfilledItems")}</Heading>

        <div className="flex items-center gap-x-4" data-testid="order-unfulfilled-items-badges">
          {requiresShipping && (
            <StatusBadge color="red" className="text-nowrap" data-testid="order-unfulfilled-items-requires-shipping-badge">
              {t("orders.fulfillment.requiresShipping")}
            </StatusBadge>
          )}

          <StatusBadge color="red" className="text-nowrap" data-testid="order-unfulfilled-items-awaiting-badge">
            {t("orders.fulfillment.awaitingFulfillmentBadge")}
          </StatusBadge>

          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: t("orders.fulfillment.fulfillItems"),
                    icon: <Buildings />,
                    to: `/orders/${order.id}/fulfillment?requires_shipping=${requiresShipping}`,
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
      <div>
        {unfulfilledItems.map((item: AdminOrderLineItem) => (
          <UnfulfilledItem
            key={item.id}
            item={item}
            currencyCode={order.currency_code}
          />
        ))}
      </div>
    </Container>
  )
}

const Fulfillment = ({
  fulfillment,
  order,
  index,
}: {
  fulfillment: AdminOrderFulfillment
  order: AdminOrder
  index: number
}) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const navigate = useNavigate()

  const showLocation = !!fulfillment.location_id

  const isPickUpFulfillment =
    fulfillment.shipping_option?.service_zone.fulfillment_set.type ===
    FulfillmentSetType.Pickup

  const { stock_location, isError, error } = useStockLocation(
    fulfillment.location_id!,
    undefined,
    {
      enabled: showLocation,
    }
  )

  let statusText = fulfillment.requires_shipping
    ? isPickUpFulfillment
      ? "Awaiting pickup"
      : "Awaiting shipping"
    : "Awaiting delivery"
  let statusColor: "blue" | "green" | "red" = "blue"
  let statusTimestamp = fulfillment.created_at

  if (fulfillment.canceled_at) {
    statusText = "Canceled"
    statusColor = "red"
    statusTimestamp = fulfillment.canceled_at
  } else if (fulfillment.delivered_at) {
    statusText = "Delivered"
    statusColor = "green"
    statusTimestamp = fulfillment.delivered_at
  } else if (fulfillment.shipped_at) {
    statusText = "Shipped"
    statusColor = "green"
    statusTimestamp = fulfillment.shipped_at
  }

  const { mutateAsync } = useCancelOrderFulfillment(order.id, fulfillment.id)
  const { mutateAsync: markAsDelivered } = useMarkOrderFulfillmentAsDelivered(
    order.id,
    fulfillment.id
  )

  const showShippingButton =
    !fulfillment.canceled_at &&
    !fulfillment.shipped_at &&
    !fulfillment.delivered_at &&
    fulfillment.requires_shipping &&
    !isPickUpFulfillment

  const showDeliveryButton =
    !fulfillment.canceled_at && !fulfillment.delivered_at

  const handleMarkAsDelivered = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("orders.fulfillment.markAsDeliveredWarning"),
      confirmText: t("actions.continue"),
      cancelText: t("actions.cancel"),
      variant: "confirmation",
    })

    if (res) {
      await markAsDelivered(undefined, {
        onSuccess: () => {
          toast.success(
            t(
              isPickUpFulfillment
                ? "orders.fulfillment.toast.fulfillmentPickedUp"
                : "orders.fulfillment.toast.fulfillmentDelivered"
            )
          )
        },
        onError: (e) => {
          toast.error(e.message)
        },
      })
    }
  }

  const handleCancel = async () => {
    if (fulfillment.shipped_at) {
      toast.warning(t("orders.fulfillment.toast.fulfillmentShipped"))
      return
    }

    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("orders.fulfillment.cancelWarning"),
      confirmText: t("actions.continue"),
      cancelText: t("actions.cancel"),
    })

    if (res) {
      await mutateAsync(undefined, {
        onSuccess: () => {
          toast.success(t("orders.fulfillment.toast.canceled"))
        },
        onError: (e) => {
          toast.error(e.message)
        },
      })
    }
  }

  if (isError) {
    throw error
  }

  const isValidUrl = (url?: string) => url && url.length > 0 && url !== "#"

  return (
    <Container className="divide-y p-0" data-testid={`order-fulfillment-${fulfillment.id}`}>
      <div className="flex items-center justify-between px-6 py-4" data-testid={`order-fulfillment-${fulfillment.id}-header`}>
        <Heading level="h2" data-testid={`order-fulfillment-${fulfillment.id}-heading`}>
          {t("orders.fulfillment.number", {
            number: index + 1,
          })}
        </Heading>
        <div className="flex items-center gap-x-4" data-testid={`order-fulfillment-${fulfillment.id}-status`}>
          <Tooltip
            content={format(
              new Date(statusTimestamp),
              "dd MMM, yyyy, HH:mm:ss"
            )}
          >
            <StatusBadge color={statusColor} className="text-nowrap" data-testid={`order-fulfillment-${fulfillment.id}-status-badge`}>
              {statusText}
            </StatusBadge>
          </Tooltip>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: t("actions.cancel"),
                    icon: <XCircle />,
                    onClick: handleCancel,
                    disabled:
                      !!fulfillment.canceled_at ||
                      !!fulfillment.shipped_at ||
                      !!fulfillment.delivered_at,
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4" data-testid={`order-fulfillment-${fulfillment.id}-items`}>
        <Text size="small" leading="compact" weight="plus" data-testid={`order-fulfillment-${fulfillment.id}-items-label`}>
          {t("orders.fulfillment.itemsLabel")}
        </Text>
        <ul data-testid={`order-fulfillment-${fulfillment.id}-items-list`}>
          {fulfillment.items.map((f_item) => (
            <li key={f_item.line_item_id} data-testid={`order-fulfillment-${fulfillment.id}-item-${f_item.line_item_id}`}>
              <Text size="small" leading="compact" data-testid={`order-fulfillment-${fulfillment.id}-item-${f_item.line_item_id}-text`}>
                {f_item.quantity}x {f_item.title}
              </Text>
            </li>
          ))}
        </ul>
      </div>
      {showLocation && (
        <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4" data-testid={`order-fulfillment-${fulfillment.id}-location`}>
          <Text size="small" leading="compact" weight="plus" data-testid={`order-fulfillment-${fulfillment.id}-location-label`}>
            {t("orders.fulfillment.shippingFromLabel")}
          </Text>
          {stock_location ? (
            <Link
              to={`/settings/locations/${stock_location.id}`}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-fg"
              data-testid={`order-fulfillment-${fulfillment.id}-location-link`}
            >
              <Text size="small" leading="compact" data-testid={`order-fulfillment-${fulfillment.id}-location-name`}>
                {stock_location.name}
              </Text>
            </Link>
          ) : (
            <Skeleton className="w-16" data-testid={`order-fulfillment-${fulfillment.id}-location-skeleton`} />
          )}
        </div>
      )}
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4" data-testid={`order-fulfillment-${fulfillment.id}-provider`}>
        <Text size="small" leading="compact" weight="plus" data-testid={`order-fulfillment-${fulfillment.id}-provider-label`}>
          {t("fields.provider")}
        </Text>

        <Text size="small" leading="compact" data-testid={`order-fulfillment-${fulfillment.id}-provider-value`}>
          {formatProvider(fulfillment.provider_id)}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4" data-testid={`order-fulfillment-${fulfillment.id}-tracking`}>
        <Text size="small" leading="compact" weight="plus" data-testid={`order-fulfillment-${fulfillment.id}-tracking-label`}>
          {t("orders.fulfillment.trackingLabel")}
        </Text>
        <div data-testid={`order-fulfillment-${fulfillment.id}-tracking-list`}>
          {fulfillment.labels && fulfillment.labels.length > 0 ? (
            <ul>
              {fulfillment.labels.map((tlink) => {
                const hasTrackingUrl = isValidUrl(tlink.tracking_url)
                const hasLabelUrl = isValidUrl(tlink.label_url)

                if (hasTrackingUrl || hasLabelUrl) {
                  return (
                    <li key={tlink.tracking_number} data-testid={`order-fulfillment-${fulfillment.id}-tracking-${tlink.tracking_number}`}>
                      {hasTrackingUrl && (
                        <a
                          href={tlink.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-fg"
                          data-testid={`order-fulfillment-${fulfillment.id}-tracking-${tlink.tracking_number}-link`}
                        >
                          <Text size="small" leading="compact" as="span" data-testid={`order-fulfillment-${fulfillment.id}-tracking-${tlink.tracking_number}-number`}>
                            {tlink.tracking_number}
                          </Text>
                        </a>
                      )}
                      {hasTrackingUrl && hasLabelUrl && " - "}
                      {hasLabelUrl && (
                        <a
                          href={tlink.label_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-fg"
                          data-testid={`order-fulfillment-${fulfillment.id}-tracking-${tlink.tracking_number}-label-link`}
                        >
                          <Text size="small" leading="compact" as="span" data-testid={`order-fulfillment-${fulfillment.id}-tracking-${tlink.tracking_number}-label`}>
                            Label
                          </Text>
                        </a>
                      )}
                    </li>
                  )
                }

                return (
                  <li key={tlink.tracking_number} data-testid={`order-fulfillment-${fulfillment.id}-tracking-${tlink.tracking_number}`}>
                    <Text size="small" leading="compact" data-testid={`order-fulfillment-${fulfillment.id}-tracking-${tlink.tracking_number}-number`}>
                      {tlink.tracking_number}
                    </Text>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Text size="small" leading="compact" data-testid={`order-fulfillment-${fulfillment.id}-tracking-empty`}>
              -
            </Text>
          )}
        </div>
      </div>

      {(showShippingButton || showDeliveryButton) && (
        <div className="bg-ui-bg-subtle flex items-center justify-end gap-x-2 rounded-b-xl px-4 py-4">
          {showDeliveryButton && (
            <Button onClick={handleMarkAsDelivered} variant="secondary">
              {t(
                isPickUpFulfillment
                  ? "orders.fulfillment.markAsPickedUp"
                  : "orders.fulfillment.markAsDelivered"
              )}
            </Button>
          )}

          {showShippingButton && (
            <Button
              onClick={() => navigate(`./${fulfillment.id}/create-shipment`)}
              variant="secondary"
            >
              {t("orders.fulfillment.markAsShipped")}
            </Button>
          )}
        </div>
      )}
    </Container>
  )
}
