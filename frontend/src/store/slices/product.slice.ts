import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '@/services/api/product.service';
import { Product, Category, Color, Size, Brand } from '@/types'; // ✅ Thêm Brand

interface ProductState {
  products: Product[];
  categories: Category[];
  brands: Brand[];  // ✅ THÊM brands
  colors: Color[];
  sizes: Size[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  bestSellers: Product[];
  loadingBestSellers: boolean;
}

const initialState: ProductState = {
  products: [],
  categories: [],
  brands: [],  // ✅ THÊM brands
  colors: [],
  sizes: [],
  selectedProduct: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  },
  bestSellers: [],
  loadingBestSellers: false,
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params?: { 
    category?: string; 
    brand?: string; 
    search?: string; 
    skinType?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const response = await productService.getProducts(params);
    return response;
  }
);

export const fetchBestSellers = createAsyncThunk(
  'product/fetchBestSellers',
  async (limit: number = 8) => {
    return await productService.getBestSellers(limit);
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

// ✅ THÊM: fetchBrands
export const fetchBrands = createAsyncThunk(
  'product/fetchBrands',
  async () => {
    return await productService.getBrands();
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
    resetPagination: (state) => {
      state.pagination.currentPage = 1;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'data' in action.payload) {
          state.products = action.payload.data || [];
          state.pagination = {
            currentPage: action.payload.currentPage || 1,
            totalPages: action.payload.totalPages || 1,
            totalItems: action.payload.totalItems || 0,
            itemsPerPage: action.payload.itemsPerPage || 12,
          };
        } else {
          state.products = Array.isArray(action.payload) ? action.payload : [];
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lấy sản phẩm thất bại';
      })
      .addCase(fetchBestSellers.pending, (state) => {
        state.loadingBestSellers = true;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.loadingBestSellers = false;
        state.bestSellers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBestSellers.rejected, (state) => {
        state.loadingBestSellers = false;
        state.bestSellers = [];
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedProduct = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // ✅ THÊM: fetchBrands
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      })
      .addCase(fetchColors.fulfilled, (state, action) => {
        state.colors = action.payload;
      })
      .addCase(fetchSizes.fulfilled, (state, action) => {
        state.sizes = action.payload;
      });
  },
});

export const { setSelectedProduct, clearSelectedProduct, resetPagination, setPage } = productSlice.actions;
export default productSlice.reducer;