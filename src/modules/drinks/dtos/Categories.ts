interface ICreateCategory {
	name: string;
}

interface IUpdateCategory {
	id: string;
	name: string;
}
interface IDeleteCategory {
	id: string;
}

interface IGetCategory {
	id: string;
}

export { ICreateCategory, IUpdateCategory, IDeleteCategory, IGetCategory };
