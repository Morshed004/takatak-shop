"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/app/actions/order";
import { Loader2, CheckCircle2, Truck, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// OrderStatus type definition
type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

// Predefined list of cancellation reasons
const CANCELLATION_REASONS = [
  "Out of Stock",
  "Payment Failed",
  "Fake Payment Details",
  "Payment Not Received",
  "Suspected Fraud",
  "Invalid Shipping Address",
  "Invalid Phone Number",
  "Customer Unreachable",
  "Duplicate Order",
  "Product Discontinued",
  "Supplier Issue",
  "Delivery Unavailable",
  "Incorrect Product Price",
  "Technical Error",
  "Policy Violation",
  "Customer Information Incomplete",
  "Other (Custom Reason)",
];

export default function OrderActionButtons({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleStatusChange = (newStatus: OrderStatus, reason?: string) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus, reason);
      if (res.success) {
        setOpenCancelModal(false);
        setSelectedReason("");
        setCustomReason("");
      } else {
        alert(res.message);
      }
    });
  };

  const handleCancelSubmit = () => {
    if (!selectedReason) {
      alert("Please select a reason for cancellation.");
      return;
    }

    const finalReason =
      selectedReason === "Other (Custom Reason)"
        ? customReason.trim()
        : selectedReason;

    if (!finalReason) {
      alert("Please specify the cancellation reason.");
      return;
    }

    handleStatusChange("CANCELLED", finalReason);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Mark Processing Button */}
      {currentStatus !== "PROCESSING" &&
        currentStatus !== "DELIVERED" &&
        currentStatus !== "CANCELLED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => handleStatusChange("PROCESSING")}
            className="gap-1.5 text-xs font-semibold border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Truck className="size-3.5" />
            )}
            Mark Processing
          </Button>
        )}

      {/* Mark Delivered Button */}
      {currentStatus !== "DELIVERED" && currentStatus !== "CANCELLED" && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => handleStatusChange("DELIVERED")}
          className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
          Mark Delivered
        </Button>
      )}

      {/* Cancel Order Button */}
      {currentStatus !== "CANCELLED" && currentStatus !== "DELIVERED" && (
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => setOpenCancelModal(true)}
          className="gap-1.5 text-xs font-semibold"
        >
          <XCircle className="size-3.5" />
          Cancel Order
        </Button>
      )}

      {/* Cancel Reason Dialog */}
      <Dialog open={openCancelModal} onOpenChange={setOpenCancelModal}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-xs font-medium text-muted-foreground block">
              Select reason for cancellation:
            </label>
            
            {/* Dropdown for selecting pre-defined cancellation reasons */}
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">-- Select Reason --</option>
              {CANCELLATION_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            {/* Custom reason text input if 'Other' is selected */}
            {selectedReason === "Other (Custom Reason)" && (
              <Textarea
                placeholder="Write specific reason here..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="text-xs min-h-20"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpenCancelModal(false)}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={handleCancelSubmit}
            >
              {isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}