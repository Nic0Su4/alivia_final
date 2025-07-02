"use client";

import { useState } from "react";
import { Appointment, Rating, User } from "@/utils/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

interface RatingDialogProps {
  appointment: Appointment | null;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: Omit<Rating, "id" | "createdAt">) => Promise<void>;
}

export const RatingDialog = ({
  appointment,
  user,
  isOpen,
  onClose,
  onSubmit,
}: RatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!appointment) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);

    await onSubmit({
      appointmentId: appointment.id,
      fromUserId: user.uid,
      toUserId: appointment.doctorId,
      rating,
      comment,
      type: "patient_to_doctor",
    });

    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Calificar a {appointment.doctorName}</DialogTitle>
          <DialogDescription>
            Tu opinión es importante para ayudar a otros pacientes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-8 w-8 cursor-pointer transition-colors",
                  hoverRating >= star || rating >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                )}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Textarea
            placeholder="Escribe un comentario (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" type="button">
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={loading || rating === 0}>
            {loading ? <Spinner size="small" /> : "Enviar Calificación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
