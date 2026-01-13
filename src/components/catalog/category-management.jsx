"use client";

import { useState } from "react";
import { CATEGORIES_DATA } from "@/lib/catalog/catalog-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Eye, EyeOff, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Category Management Component
 * 
 * Manages categories: Create, Rename, Reorder, Hide/Unhide
 */
export function CategoryManagement() {
  const [categories, setCategories] = useState([...CATEGORIES_DATA]);
  const [editingId, setEditingId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingName, setEditingName] = useState("");

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      visibility: "active",
      displayOrder: categories.length + 1,
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName("");
    alert("Category created!");
  };

  const handleRenameCategory = (categoryId) => {
    if (!editingName.trim()) {
      alert("Please enter a category name");
      return;
    }

    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, name: editingName.trim() } : cat
      )
    );
    setEditingId(null);
    setEditingName("");
    alert("Category renamed!");
  };

  const handleToggleVisibility = (categoryId) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              visibility: cat.visibility === "active" ? "hidden" : "active",
            }
          : cat
      )
    );
    alert("Category visibility updated!");
  };

  const handleReorder = (categoryId, direction) => {
    const index = categories.findIndex((c) => c.id === categoryId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === categories.length - 1)
    ) {
      return;
    }

    const newCategories = [...categories];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newCategories[index], newCategories[newIndex]] = [
      newCategories[newIndex],
      newCategories[index],
    ];

    // Update display orders
    newCategories.forEach((cat, idx) => {
      cat.displayOrder = idx + 1;
    });

    setCategories(newCategories);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage product categories. Every product must belong to exactly one category.
          </p>
        </div>
      </div>

      {/* Create New Category */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              id="newCategory"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateCategory();
                }
              }}
            />
          </div>
          <Button onClick={handleCreateCategory} className="gap-2">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Visibility</TableHead>
              <TableHead className="text-center">Display Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleReorder(category.id, "up")}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingId === category.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="h-8 w-48"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRenameCategory(category.id);
                            }
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditingName("");
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRenameCategory(category.id)}
                          className="h-8"
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName("");
                          }}
                          className="h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <span className="font-medium text-gray-900">{category.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={cn(
                        "text-xs",
                        category.visibility === "active"
                          ? "bg-green-500 text-white"
                          : "bg-gray-500 text-white"
                      )}
                    >
                      {category.visibility === "active" ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-gray-600">
                    {category.displayOrder}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingName(category.name);
                        }}
                        className="h-8"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Rename
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(category.id)}
                        className="h-8"
                      >
                        {category.visibility === "active" ? (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Show
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Rules Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Rules</h4>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Every product must belong to exactly one category</li>
          <li>Hiding a category hides all products within it</li>
          <li>Categories can be reordered to change display order</li>
          <li>Categories cannot be deleted if they have active products</li>
        </ul>
      </div>
    </div>
  );
}
