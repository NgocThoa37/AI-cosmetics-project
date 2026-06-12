import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '@/services/api/product.service';
import { Product, Category, Color, Size } from '@/types';

interface ProductState {
  products: Product[];
  categories: Category[];
  colors: Color[];
  sizes: Size[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  categories: [],
  colors: [],
  sizes: [],
  selectedProduct: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params?: { category?: string; brand?: string; search?: string; skinType?: string }) => {
    return await productService.getProducts(params);
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (id: string) => {
    return await productService.getProductById(id);
  }
);

export const fetchCategories = createAsyncThunk(
  'product/fetchCategories',
  async () => {
    return await productService.getCategories();
  }
);

export const fetchColors = createAsyncThunk(
  'product/fetchColors',
  async () => {
    return await productService.getColors();
  }
);

export const fetchSizes = createAsyncThunk(
  'product/fetchSizes',
  async () => {
    return await productService.getSizes();
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lấy sản phẩm thất bại';
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedProduct = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchColors.fulfilled, (state, action) => {
        state.colors = action.payload;
      })
      .addCase(fetchSizes.fulfilled, (state, action) => {
        state.sizes = action.payload;
      });
  },
});

export const { setSelectedProduct, clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;