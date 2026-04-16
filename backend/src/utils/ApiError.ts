export default class ApiError extends Error {
	public statusCode: number;
	public isOperational: boolean;
	public errors?: Array<{ field: string; message: string }>;

	constructor(
		statusCode: number,
		message: string,
		isOperational = true,
		errors?: Array<{ field: string; message: string }>,
	) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.errors = errors;
		Error.captureStackTrace(this, this.constructor);
	}
}
