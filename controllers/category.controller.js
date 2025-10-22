import Category from "../models/category.model.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    if (!categories) {
      return res
        .status(404)
        .json({ message: "No categories found!", success: false });
    }
    res.status(200).json({ categories, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ message: "Category doesn't exist!", success: false });
    }
    res.status(200).json({ category, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new Category({
      name: name,
    });
    newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    res
      .status(200)
      .json({ message: "Category updated successfully!", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const selectedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!selectedCategory) {
      return res
        .status(404)
        .json({ message: "Category not found!!!", success: false });
    }
    res
      .status(200)
      .json({ message: "Category deleted successfully!", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
