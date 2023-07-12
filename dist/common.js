"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checking = void 0;
const checker_1 = require("./checker");
const checking = (url, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (!url) {
        console.error('URL is not specified');
    }
    else {
        const checker = new checker_1.Checker(url, options);
        return yield checker.start()
            .then((r) => {
            return r;
        })
            .catch((r) => {
            return r;
        });
    }
    return false;
});
exports.checking = checking;
