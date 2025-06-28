"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFigmaToken = setFigmaToken;
const api_js_1 = require("./api.js");
const axios_retry_1 = __importDefault(require("axios-retry"));
let figmaToken = (_a = process.env.FIGMA_TOKEN) !== null && _a !== void 0 ? _a : "";
const requestConfig = {
    baseURL: (_b = process.env.API_URL) !== null && _b !== void 0 ? _b : "https://api.figma.com",
    headers: {
        'Content-Type': 'application/json',
    },
};
const apiClientInstance = new api_js_1.Api(requestConfig);
// Configure axios-retry
(0, axios_retry_1.default)(apiClientInstance.instance, {
    retries: 1,
    retryDelay: (retryCount) => {
        return Math.pow(2, retryCount) * 500; // Exponential back-off delay between retries
    },
    retryCondition: (error) => {
        var _a, _b;
        // Retry on network errors or 5xx responses
        return ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) !== 500 && ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) !== 401;
    },
});
apiClientInstance.instance.interceptors.request.use((request) => {
    request.headers['X-Figma-Token'] = figmaToken;
    return request;
});
function setFigmaToken(token) {
    figmaToken = token;
}
exports.default = apiClientInstance;
