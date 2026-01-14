import React from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

// PUBLIC_INTERFACE
export function ConfirmDeleteModal({ open, noteTitle, onCancel, onConfirm }) {
  /** Confirm deletion modal. */
  return (
    <Modal
      open={open}
      title="Delete note?"
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </>
      }
    >
      This will permanently remove <strong>{noteTitle?.trim() || "this note"}</strong> from this browser. This action
      cannot be undone.
    </Modal>
  );
}
