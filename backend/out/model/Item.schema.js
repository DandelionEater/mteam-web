"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemModel = exports.Item = void 0;
const typegoose_1 = require("@typegoose/typegoose");
class GalleryEntry {
}
__decorate([
    (0, typegoose_1.prop)()
], GalleryEntry.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)()
], GalleryEntry.prototype, "description", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [String] })
], GalleryEntry.prototype, "images", void 0);
class Item {
}
exports.Item = Item;
__decorate([
    (0, typegoose_1.prop)({ required: true })
], Item.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)()
], Item.prototype, "description", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true })
], Item.prototype, "manufacturingID", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true })
], Item.prototype, "stock", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true })
], Item.prototype, "price", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [String] })
], Item.prototype, "images", void 0);
__decorate([
    (0, typegoose_1.prop)({ _id: false }) // embedded subdocument
], Item.prototype, "galleryEntry", void 0);
exports.ItemModel = (0, typegoose_1.getModelForClass)(Item);
