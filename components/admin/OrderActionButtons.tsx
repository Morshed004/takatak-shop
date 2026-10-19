"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle } from "lucide-react";

const cancellationReasons = [
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
  "Customer Information Incomplete"
];

export default function OrderActionButtons({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  
  // State for cancellation reason selection
  const [selectedReason, setSelectedReason] = useState<string>("");

  // Function to handle order status updates (Processing, Delivered, Cancelled)
  const handleUpdateStatus = async (newStatus: string, cancelReason?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, cancelReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      setIsCancelModalOpen(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentStatus !== "DELIVERED" && currentStatus !== "CANCELLED" && (
        <>
          <Button 
            variant="default" 
            size="sm" 
            className="rounded-xl gap-1 bg-emerald-600 hover:bg-emerald-700 text-xs"
            onClick={() => handleUpdateStatus("PROCESSING")}
            disabled={loading}
          >
            <CheckCircle2 className="size-4" /> Mark Processing
          </Button>

          <Button 
            variant="default" 
            size="sm" 
            className="rounded-xl gap-1 bg-emerald-700 hover:bg-emerald-800 text-xs"
            onClick={() => handleUpdateStatus("DELIVERED")}
            disabled={loading}
          >
            <CheckCircle2 className="size-4" /> Mark Delivered
          </Button>

          <Button 
            variant="destructive" 
            size="sm" 
            className="rounded-xl gap-1 text-xs"
            onClick={() => setIsCancelModalOpen(true)}
            disabled={loading}
          >
            <XCircle className="size-4" /> Cancel Order
          </Button>
        </>
      )}

      {/* Cancellation Reason Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Please select a reason for cancelling this order. This will be recorded in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <Label className="text-xs font-semibold">Cancellation Reason *</Label>
            <Select onValueChange={(value) => setSelectedReason(value || "")} value={selectedReason}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {cancellationReasons.map((reason, index) => (
                  <SelectItem key={index} value={reason} className="text-xs">
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button 
              variant="outline" 
              className="rounded-xl text-xs" 
              onClick={() => setIsCancelModalOpen(false)}
            >
              Close
            </Button>
            <Button 
              variant="destructive" 
              className="rounded-xl text-xs"
              disabled={!selectedReason || loading}
              onClick={() => handleUpdateStatus("CANCELLED", selectedReason)}
            >
              {loading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}