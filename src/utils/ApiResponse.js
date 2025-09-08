class ApiResponse {
    constructor(statusCode, message = "success", data){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.status = statusCode >= 200 && statusCode < 300 ? "success" : "error";
    }
}

export default ApiResponse;