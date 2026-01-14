import api from "./api";
import { ProductSize } from "../models/ProductSize";

export async function listProductSizes(subCategoryId?: number): Promise<ProductSize[]> {
    const params = subCategoryId ? { subCategoryId } : {};
    const { data } = await api.get("/product-sizes", { params });
    return data;
}

export async function getProductSize(id: number): Promise<ProductSize> {
    const { data } = await api.get(`/product-sizes/${id}`);
    return data;
}

export async function createProductSize(dto: ProductSize): Promise<ProductSize> {
    const { data } = await api.post("/product-sizes", dto);
    return data;
}

export async function updateProductSize(id: number, dto: ProductSize): Promise<ProductSize> {
    const { data } = await api.put(`/product-sizes/${id}`, dto);
    return data;
}

export async function deleteProductSize(id: number): Promise<void> {
    await api.delete(`/product-sizes/${id}`);
}
