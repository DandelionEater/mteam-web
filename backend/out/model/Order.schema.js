"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = exports.Order = void 0;
const typegoose_1 = require("@typegoose/typegoose");
class OrderItem {
}
__decorate([
    (0, typegoose_1.prop)({ required: true })
], OrderItem.prototype, "manufacturingID", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true })
], OrderItem.prototype, "quantity", void 0);
class Order {
}
exports.Order = Order;
__decorate([
    (0, typegoose_1.prop)({ required: true })
], Order.prototype, "enteredEmail", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true })
], Order.prototype, "delivery", void 0);
__decorate([
    (0, typegoose_1.prop)()
], Order.prototype, "address", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [OrderItem], _id: false })
], Order.prototype, "items", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true })
], Order.prototype, "total", void 0);
exports.OrderModel = (0, typegoose_1.getModelForClass)(Order);
