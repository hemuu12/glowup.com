const express = require("express");
const mongoose = require("mongoose");
const ProductModel = require("../Models/Product.model");
const UserModel = require("../Models/User.model");
require("dotenv").config();

const adminRouter = express.Router();

adminRouter.get("/products", async (req, res) => {
	const { category, brand, sort, order, product_type } = req.query;
	try {
		let tmp = {};
		if (category && brand) {
			tmp = {
				$and: [
					{
						category: {
							$regex: category,
							$options: "i",
						},
					},
					{
						brand: {
							$regex: brand,
							$options: "i",
						},
					},
				],
			};
		} else if (category) {
			tmp = { category: { $regex: category, $options: "i" } };
		} else if (brand) {
			tmp = { brand: { $regex: brand, $options: "i" } };
		}
		if (product_type) {
			tmp = {
				...tmp,
				product_type: { $regex: product_type, $options: "i" },
			};
		}
		console.log(tmp);
		let data = [];
		if (sort) {
			data = await ProductModel.find(tmp).sort(
				sort === "rating"
					? { rating: order === "asc" ? 1 : -1 }
					: { price: order === "asc" ? 1 : -1 }
			);
		} else {
			data = await ProductModel.find(tmp);
		}
		res.send({
			status: 200,
			data: data,
		});
	} catch (error) {
		res.send({ status: 400, error: error });
	}
});

// * admin search route

adminRouter.get("/search", async (req, res) => {
	const { q } = req.query;
	if (!q) {
		res.send({ status: 400, message: "Please enter a valid search term" });
	} else {
		let tmp = {};
		tmp = {
			$or: [
				{ name: { $regex: q, $options: "i" } },
				{ brand: { $regex: q, $options: "i" } },
				{ product_type: { $regex: q, $options: "i" } },
			],
		};
		try {
			let data = await ProductModel.find(tmp);
			res.send({ status: 200, data: data });
		} catch (error) {
			res.send({ status: 400, error: error });
		}
	}
});

// * add a new item to the list

adminRouter.post("/addproduct", async (req, res) => {
	const {
		name,
		price,
		brand,
		description,
		image_link,
		rating,
		category,
		product_type,
		tag_list,
		api_featured_image,
		product_colors,
	} = req.body;
	try {
		let product = new ProductModel(req.body);
		await product.save();
		res.send({
			status: 201,
			message: `${name} has been successfully added to the list`,
		});
	} catch (error) {
		res.send({ status: 400, message: error.message });
	}
});

// *add multiple
adminRouter.post("/addmultiple", async (req, res) => {
	try {
		await ProductModel.insertMany(req.body);
		res.send({ message: "Success" });
	} catch (error) {
		res.send({ message: error.message });
	}
});

// * update product

adminRouter.patch("/update/:id", async (req, res) => {
	try {
		await ProductModel.findByIdAndUpdate(req.params.id, req.body);
		res.send({
			status: 200,
			message: "Product has been successfully updated",
		});
	} catch (error) {
		res.send({ status: 400, message: error.message });
	}
});

// * delete product

adminRouter.delete("/delete/:id", async (req, res) => {
	try {
		await ProductModel.findByIdAndDelete(req.params.id);
		res.send({
			status: 200,
			message: "Product has been successfully deleted",
		});
	} catch (error) {
		res.send({ status: 400, message: error.message });
	}
});

// * users list

adminRouter.get("/users", async (req, res) => {
	try {
		let data = await UserModel.find();
		res.send({ status: 200, data: data });
	} catch (error) {
		res.send({ status: 404, error: error });
	}
});

// * users delete list

adminRouter.delete("/deleteuser/:id", async (req, res) => {
	try {
		await UserModel.findByIdAndDelete(id);
		res.send({ status: 200, message: "User deleted" });
	} catch (error) {
		res.send({ status: 404, error: error });
	}
});

module.exports = adminRouter;