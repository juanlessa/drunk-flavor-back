
interface IDrink{
    id?: string,
    name: string,
    method: string,
    ingredients: {
        ingredientId: string,
        quantity: number
    }[]
}


interface IDrinkResponse {
    id?: string,
    name: string,
    method: string,
    ingredients: {
        ingredientId: string,
        quantity: number,
        name: string,
        unity: string,
        category: string,
        isAlcoholic: boolean,
        colorTheme: string,
        created_at: Date
    
    }[]
}


export {IDrink , IDrinkResponse };
