import { FoodItem } from '../types';

const API_URL = 'https://world.openfoodfacts.org/api/v2/product/';

export const fetchFoodByBarcode = async (barcode: string): Promise<FoodItem | null> => {
  try {
    const response = await fetch(`${API_URL}${barcode}?fields=product_name,nutriments,serving_size,brands`);
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      console.log('Product not found in Open Food Facts:', data.status_verbose);
      return null;
    }

    const product = data.product;
    const nutriments = product.nutriments || {};

    const servingSize = product.serving_size || '100g';
    const calories = nutriments['energy-kcal_serving'] || nutriments['energy-kcal_100g'] || 0;
    const protein = nutriments.proteins_serving || nutriments.proteins_100g || 0;
    const carbs = nutriments.carbohydrates_serving || nutriments.carbohydrates_100g || 0;
    const fat = nutriments.fat_serving || nutriments.fat_100g || 0;

    if (!product.product_name || calories === 0) {
        console.log('Incomplete data from Open Food Facts');
        return null;
    }

    return {
      id: barcode,
      name: `${product.brands ? product.brands + ' - ' : ''}${product.product_name}`,
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      servingSize: servingSize,
    };
  } catch (error) {
    console.error("Error fetching from Open Food Facts API:", error);
    return null;
  }
};
