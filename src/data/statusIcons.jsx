// Single source of truth for status -> icon -> color, per Section 7 of the
// build guide: "Maintain one small icon-mapping file so this stays
// consistent everywhere the status appears — home page, admin, tracking page."
import {
  PackageCheck,
  PackagePlus,
  PackageSearch,
  PlaneTakeoff,
  Truck,
  MapPinCheck,
  ShieldCheck,
  Unlock,
  Bike,
  CheckCircle2,
  AlertTriangle,
  Lock,
  MapPinOff,
  Undo2,
} from 'lucide-react'

// Ordered to match the standard flow in Section 5.
export const STATUS_FLOW = [
  'order_confirmed',
  'package_prepared',
  'picked_up',
  'departed_origin',
  'in_transit',
  'arrived_destination',
  'customs_clearance',
  'released_from_customs',
  'out_for_delivery',
  'delivered',
]

export const EXCEPTION_STATUSES = [
  'delivery_attempt_failed',
  'held_by_customs',
  'address_issue',
  'returned_to_sender',
]

// color: 'pending' | 'done' | 'final' | 'exception' — maps to the
// --color-status-* tokens defined in index.css (Section 9).
export const STATUS_META = {
  order_confirmed:        { label: 'Order Confirmed',          icon: PackageCheck,   color: 'done' },
  package_prepared:       { label: 'Package Prepared',         icon: PackagePlus,    color: 'pending' },
  picked_up:              { label: 'Picked Up',                icon: PackageSearch,  color: 'pending' },
  departed_origin:        { label: 'Departed Origin Country',  icon: PlaneTakeoff,   color: 'pending' },
  in_transit:             { label: 'In Transit',               icon: Truck,          color: 'pending' },
  arrived_destination:    { label: 'Arrived in Destination Country', icon: MapPinCheck, color: 'pending' },
  customs_clearance:      { label: 'Customs Clearance',        icon: ShieldCheck,    color: 'pending' },
  released_from_customs:  { label: 'Released from Customs',    icon: Unlock,         color: 'final' },
  out_for_delivery:       { label: 'Out for Delivery',         icon: Bike,           color: 'final' },
  delivered:               { label: 'Delivered',                icon: CheckCircle2,  color: 'done' },

  delivery_attempt_failed: { label: 'Delivery Attempt Failed', icon: AlertTriangle, color: 'exception' },
  held_by_customs:          { label: 'Held by Customs',         icon: Lock,          color: 'exception' },
  address_issue:             { label: 'Address Issue',           icon: MapPinOff,     color: 'exception' },
  returned_to_sender:        { label: 'Returned to Sender',      icon: Undo2,         color: 'exception' },
}

export function statusMeta(status) {
  return STATUS_META[status] ?? { label: status, icon: PackageSearch, color: 'pending' }
}
