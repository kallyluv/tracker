import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { listItems, getItem, createItem, updateItem, deleteItem } from "../controllers/items.js";
import { requireAuth } from "../controllers/auth.js";

const router = Router();

router.get("/", asyncHandler(listItems));
router.get("/:id", asyncHandler(getItem));
router.post("/", requireAuth, asyncHandler(createItem));
router.put("/:id", requireAuth, asyncHandler(updateItem));
router.delete("/:id", requireAuth, asyncHandler(deleteItem));

export default router;
