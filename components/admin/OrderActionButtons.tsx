"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/app/actions/order";
import { Loader2, CheckCircle2, Truck, XCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useGateway } from "@/context/GatewayContext";

// OrderStatus type definition
type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

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

  // Gateway session context hooks
  const { apiUrl, apiKey, isConfigured } = useGateway();

  const handleStatusChange = (newStatus: OrderStatus, reason?: string) => {
    if (!isConfigured) {
      toast.error("Gateway API configuration missing! Please configure keys from the header.");
      return;
    }

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus, reason, apiUrl, apiKey);
      if (res.success) {
        setOpenCancelModal(false);
        setSelectedReason("");
        setCustomReason("");
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleCancelSubmit = () => {
    if (!selectedReason) {
      toast.warning("Please select a reason for cancellation.");
      return;
    }

    const finalReason =
      selectedReason === "Other (Custom Reason)"
        ? customReason.trim()
        : selectedReason;

    if (!finalReason) {
      toast.warning("Please specify the cancellation reason.");
      return;
    }

    handleStatusChange("CANCELLED", finalReason);
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      {!isConfigured && (
        <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
          <AlertTriangle className="size-3.5" />
          <span>Gateway API not configured (Actions Disabled)</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {/* Mark Processing Button */}
        {currentStatus !== "PROCESSING" &&
          currentStatus !== "DELIVERED" &&
          currentStatus !== "CANCELLED" && (
            <Button
              size="sm"
              variant="outline"
              disabled={!isConfigured || isPending}
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
            disabled={!isConfigured || isPending}
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
            disabled={!isConfigured || isPending}
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
              <DialogTitle className="text-base font-bold">
                Cancel Order
              </DialogTitle>
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
                disabled={!isConfigured || isPending}
                onClick={handleCancelSubmit}
              >
                {isPending && (
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                )}
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}